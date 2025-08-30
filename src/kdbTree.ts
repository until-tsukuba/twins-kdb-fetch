import { writeFile } from "node:fs/promises";

import endpoints from "./fetch/endpoints.js";
import { FlowType } from "./fetch/types.js";

import { getSubjectsRecord } from "./parser/parseCsv.js";
import { parseKdbHtml } from "./parser/parseKdbTwins.js";
import { buildKdbSubCategories } from "./parser/buildKdbSubCategories.js";

import { dfs } from "./tree/dfs.js";
import { LeafResultNode } from "./tree/types.js";
import { createLeafResultNode } from "./tree/createNode.js";
import { createFlatList } from "./tree/createFlatList.js";
import { createTreeText } from "./tree/createTreeText.js";

import { cache, JSONSerializer } from "./util/cache.js";
import { Hierarchy } from "./util/types.js";

const getNextHierarchy = async (flow: FlowType, hierarchy: Hierarchy) => {
    const newFlow = await endpoints.kdb.changeHierarchy(flow, Math.max(hierarchy.getLength(), 1), hierarchy);
    const html = await endpoints.getContent(newFlow, "utf8");
    const hierarchySelectors = await parseKdbHtml(html);

    const choices = hierarchySelectors[hierarchy.getLength()] ?? [];
    const children = hierarchy.genChildren(choices);
    return { newFlow, children };
};

const getNextHierarchyWithCache = cache(
    (_flow: FlowType, hierarchy: Hierarchy) => `${hierarchy.serialize()}.children.json`,
    (flow: FlowType, hierarchy: Hierarchy) => getNextHierarchy(flow, hierarchy),
    JSONSerializer()
);

const getSubjectRecords = async (flow: FlowType, hierarchy: Hierarchy) => {
    const newFlow = await endpoints.kdb.searchSubject(flow, hierarchy);
    const downloadFlow = await endpoints.kdb.outputCsv(newFlow, hierarchy);
    const csv = await endpoints.getContent(downloadFlow, "shift-jis");

    const categories = getSubjectsRecord(csv, `${hierarchy.serialize()}.subjects.json`);

    const subCategories = buildKdbSubCategories(categories);
    const subjects = createLeafResultNode(hierarchy, subCategories);

    return subjects;
};

const getSubjectRecordsWithCache = cache(
    (_flow: FlowType, hierarchy: Hierarchy) => `${hierarchy.serialize()}.subjects.json`,
    (flow: FlowType, hierarchy: Hierarchy) => getSubjectRecords(flow, hierarchy),
    JSONSerializer()
);
const mutableFlow = (init: FlowType) => {
    let currentFlow = init;
    return {
        getCurrentFlow() {
            return currentFlow;
        },
        setFlow(flow: FlowType) {
            currentFlow = flow;
        },
    };
};

export const getKdbTreeData = async () => {
    const flow = mutableFlow(await endpoints.kdb.init());

    const tree = await dfs<Hierarchy, LeafResultNode[]>(
        Hierarchy.root,
        async (node) => {
            const { newFlow, children } = await getNextHierarchyWithCache(flow.getCurrentFlow(), node);
            flow.setFlow(newFlow);
            return children;
        },
        async (node) => {
            return await getSubjectRecordsWithCache(flow.getCurrentFlow(), node);
        }
    );

    const subjectsFlatList = createFlatList(tree);

    const subjectCategoryText = createTreeText(tree);

    await writeFile(
        "output/tree.kdb.json",
        JSON.stringify(
            tree,
            (_key, value) => {
                if (value instanceof Hierarchy) {
                    return value.toOutputJSON();
                }
                return value;
            },
            4
        ),
        "utf8"
    );
    await writeFile(
        "output/subjects.flat.kdb.json",
        JSON.stringify(
            subjectsFlatList,
            (_key, value) => {
                if (value instanceof Hierarchy) {
                    return value.toOutputJSON();
                }
                return value;
            },
            4
        ),
        "utf8"
    );
    await writeFile("output/hierarchy.kdb.txt", subjectCategoryText, "utf8");

    return {
        tree,
        subjectsFlatList,
        subjectCategoryText,
    };
};

// getKdbData();
