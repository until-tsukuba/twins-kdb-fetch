import { ReadableSubjectRecord } from "../util/readableSubject";
import { Hierarchy } from "../util/types";
import { DfsTreeNode } from "./dfs";
import { LeafResultNode } from "./types";
import { visitTree } from "./visitTree.js";

const shallowEqual = (a: unknown, b: unknown) => {
    return JSON.stringify(a) === JSON.stringify(b);
};

export const createFlatList = (tree: DfsTreeNode<Hierarchy, LeafResultNode[]>) => {
    const subjectsFlatMap = new Map<string, ReadableSubjectRecord & { hierarchy: Hierarchy[] }>();

    visitTree<DfsTreeNode<Hierarchy, LeafResultNode[]> | LeafResultNode>(tree, (node) => {
        if (node.type === "subject") {
            const existing = subjectsFlatMap.get(node.subject.courseNumber);
            const newHierarchy = [...(existing?.hierarchy ?? []), node.node];

            // assert
            if (existing) {
                if (!shallowEqual({ ...node.subject, hierarchy: undefined }, { ...existing, hierarchy: undefined })) {
                    throw new Error(`! subject ${node.subject.courseNumber} already exists with different data, ${JSON.stringify(existing)} vs ${JSON.stringify(node.subject)}`);
                }
            }

            subjectsFlatMap.set(node.subject.courseNumber, {
                ...node.subject,
                hierarchy: newHierarchy,
            });
        }
    });
    const subjectsFlatList = [...subjectsFlatMap.values()];
    return subjectsFlatList;
};
