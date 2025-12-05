import { writeFile } from "node:fs/promises";

import type { KdBFlowType } from "./fetch/kdb/types.js";

import { dfs } from "./tree/dfs.js";
import { LeafResultNode } from "./tree/types.js";
import { createLeafResultNode } from "./tree/createNode.js";
import { createFlatList } from "./tree/createFlatList.js";
import { createTreeText } from "./tree/createTreeText.js";

import { outputReplacer } from "./util/jsonReplacer.js";
import { getChildRequisiteWithCache, getKdbInitFlow, getSubjectRecordsWithCache } from "./helper/kdb/subjects.js";
import { Requisite } from "./util/types.js";

const getNextHierarchy = async (flow: KdBFlowType, requisite: Requisite) => {
    const children = await getChildRequisiteWithCache(flow, requisite);

    return children;
};

const getSubjectRecordTree = async (flow: KdBFlowType, requisite: Requisite) => {
    const kdbSubjectRecords = await getSubjectRecordsWithCache(flow, requisite);

    const subjects = createLeafResultNode(kdbSubjectRecords);

    return subjects;
};

export const getKdbTreeData = async () => {
    const flow = await getKdbInitFlow();

    const tree = await dfs<Requisite, LeafResultNode[]>(
        Requisite.root,
        async (node) => {
            console.log(`Processing getNext hierarchy node: ${node.serialize()}`);
            return await getNextHierarchy(flow, node);
        },
        async (node) => {
            console.log(`Processing getSubjectRecords hierarchy node: ${node.serialize()}`);
            return await getSubjectRecordTree(flow, node);
        },
    );

    const subjectsFlatList = createFlatList(tree);

    const subjectCategoryText = createTreeText(tree);

    await writeFile("output/tree.kdb.json", JSON.stringify(tree, outputReplacer, 4), "utf8");
    await writeFile("output/subjects.flat.kdb.json", JSON.stringify(subjectsFlatList, outputReplacer, 4), "utf8");
    await writeFile("output/hierarchy.kdb.txt", subjectCategoryText, "utf8");

    return {
        tree,
        subjectsFlatList,
        subjectCategoryText,
    };
};

// getKdbData();
