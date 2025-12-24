import type { KdBFlowType } from "./fetch/kdb/types.js";

import { dfs } from "./tree/dfs.js";
import { SubjectNode } from "./tree/types.js";
import { createSubjectNodeList } from "./tree/createNode.js";
import { createFlatList } from "./tree/createFlatList.js";
import { createTreeText } from "./tree/createTreeText.js";

import { writeOutputJsonFile, writeOutputTextFile } from "./util/output.js";
import { getChildRequisiteWithCache, getKdbInitFlow, getSubjectRecordsWithCache } from "./helper/kdb/subjects.js";
import { Requisite } from "./util/requisite.js";
import { wrapWithStepLogging } from "./log.js";

const getNextHierarchy = (flow: KdBFlowType) => async (requisite: Requisite) => {
    const children = await getChildRequisiteWithCache(flow, requisite);

    return children;
};

const getSubjectRecordTree = (flow: KdBFlowType) => async (requisite: Requisite) => {
    const kdbSubjectRecords = await getSubjectRecordsWithCache(flow, requisite);

    const subjects = createSubjectNodeList(kdbSubjectRecords);

    return subjects;
};

export const getKdbTreeData = wrapWithStepLogging("kdb-tree", async () => {
    const flow = await getKdbInitFlow();

    const tree = await dfs<Requisite, SubjectNode[]>(Requisite.root, getNextHierarchy(flow), getSubjectRecordTree(flow));

    const subjectsFlatList = createFlatList(tree);

    const subjectCategoryText = createTreeText(tree);

    await writeOutputJsonFile(tree, "tree.kdb.json");
    await writeOutputJsonFile(subjectsFlatList, "subjects.flat.kdb.json");
    await writeOutputTextFile(subjectCategoryText, "hierarchy.kdb.txt");

    return {
        tree,
        subjectsFlatList,
        subjectCategoryText,
    };
});
