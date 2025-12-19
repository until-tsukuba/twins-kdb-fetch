import endpoints from "../../fetch/endpoints.js";
import { KdBFlowType } from "../../fetch/kdb/types.js";
import { log } from "../../log.js";
import { buildKdbSubjects } from "../../parser/kdb/buildKdbSubject.js";
import { getSubjectsRecord } from "../../parser/kdb/parseCsv.js";
import { parseRequisite } from "../../parser/kdb/parseRequisite.js";
import { cache, JSONSerializer } from "../../util/cache.js";
import { Requisite } from "../../util/requisite.js";

export const getKdbInitFlow = async (): Promise<KdBFlowType> => {
    const flow = await endpoints.kdb.init();
    return flow;
};

const getSubjectRecords = async (flow: KdBFlowType, requisiteCode: Requisite) => {
    const searchResultString = await endpoints.kdb.outputCsv(flow, requisiteCode.getId());
    const parsedSearchResult = getSubjectsRecord(searchResultString, requisiteCode.isRoot(), `${requisiteCode.serialize()}.subjects.json`);
    if (requisiteCode.getName() !== parsedSearchResult.category) {
        log.info(`Requisite name mismatch: ${requisiteCode.getName()} !== ${parsedSearchResult.category}`);
        log.irregular(`Requisite name mismatch: ${requisiteCode.getName()} !== ${parsedSearchResult.category}`);
    }
    const kdbSubjectRecords = await buildKdbSubjects(parsedSearchResult.subjects);

    return kdbSubjectRecords;
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
