import endpoints from "../../fetch/endpoints";
import { KdBFlowType } from "../../fetch/kdb/types";
import { buildKdbSubjects } from "../../parser/kdb/buildKdbSubject";
import { parseRequisite } from "../../parser/kdb/parseRequisite";
import { parseSearchResult } from "../../parser/kdb/parseSearchResult";
import { cache, JSONSerializer } from '../../util/cache';
import { Requisite } from '../../util/types';

export const getKdbInitFlow = async (): Promise<KdBFlowType> => {
    const flow = await endpoints.kdb.init();
    return flow;
};

const pagenation = async <R>(fetcher: (page: number) => Promise<{ results: R[], next: boolean, total: number }>): Promise<R[]> => {
    const results: R[] = [];
    let page = 0;

    while (true) {
        const { results: newResults, next, total } = await fetcher(page);
        console.log(`page: ${page}/${Math.ceil(total / 50) - 1}, total: ${total}`);
        results.push(...newResults);
        if (!next) {
            break;
        }
        page++;
    }

    return results;
}

const getSubjectRecords = async (flow: KdBFlowType, requisiteCode: Requisite) => {
    return await pagenation(async (page: number) => {
        // TODO: pagenation
        const searchResultString = await endpoints.kdb.searchSubject(flow, requisiteCode.getId(), page);
        const obj = JSON.parse(searchResultString) as unknown;
        // obj は 数値と文字列が混在しているため、注意が必要
        // const next = obj.next; // obj.next は251ページからは嘘の値を返すことがある
        if (typeof obj !== "object" || obj === null || !("end" in obj) || !(typeof obj.end === "string" || typeof obj.end === "number") || !("total" in obj) || !(typeof obj.total === "string" || typeof obj.total === "number") || !("list" in obj) || typeof obj.list !== "string") {
            throw new Error("Invalid search result format");
        }
        const next = (+obj.end) !== (+obj.total);
        const body = obj.list;
        const parsedSearchResult = await parseSearchResult(body);
        const kdbSubjectRecords = buildKdbSubjects(parsedSearchResult);

        return { results: kdbSubjectRecords, next: next, total: +obj.total };
    });
};


export const getSubjectRecordsWithCache = cache(
    (_flow: KdBFlowType, requisite: Requisite) => `${requisite.serialize()}.subjects.json`,
    (flow: KdBFlowType, requisite: Requisite) => getSubjectRecords(flow, requisite),
    JSONSerializer(),
);

const getChildRequisite = async (flow: KdBFlowType, parentRequisiteCode: Requisite) => {
    if (parentRequisiteCode.getHasLower() === false) {
        return [];
    }

    const requisiteString = await endpoints.kdb.getLowerHierarchy(flow, parentRequisiteCode.getId());
    const choices = await parseRequisite(requisiteString);

    const children = Requisite.genMultiple(choices);
    return children;
};

export const getChildRequisiteWithCache = cache(
    (_flow: KdBFlowType, requisite: Requisite) => `${requisite.serialize()}.children.json`,
    (flow: KdBFlowType, requisite: Requisite) => getChildRequisite(flow, requisite),
    JSONSerializer(),
);

