import { KdbSubjectRecord } from "../parser/kdb/types.js";
import { Requisite } from "../util/requisite.js";
import { DfsTreeNode } from "./dfs.js";
import { SubjectNode } from "./types.js";
import { visitTree } from "./visitTree.js";

const shallowEqual = (a: unknown, b: unknown) => {
    return JSON.stringify(a) === JSON.stringify(b);
};

export const createFlatList = (tree: DfsTreeNode<Requisite, readonly SubjectNode[]>) => {
    const subjectsFlatMap = new Map<string, KdbSubjectRecord & { readonly requisite: readonly Requisite[] }>();

    visitTree<DfsTreeNode<Requisite, readonly SubjectNode[]> | SubjectNode>(tree, (node, _depth, parent) => {
        if (node.type === "subject") {
            const existing = subjectsFlatMap.get(node.subject.courseCode);
            const newRequisite = [...(existing?.requisite ?? [])];
            if (parent && newRequisite.every((r) => !r.equals(parent.node))) {
                newRequisite.push(parent.node);
            }

            // assert
            if (existing) {
                if (!shallowEqual({ ...node.subject, requisite: undefined }, { ...existing, requisite: undefined })) {
                    throw new Error(`! subject ${node.subject.courseCode} already exists with different data, ${JSON.stringify(existing)} vs ${JSON.stringify(node.subject)}`);
                }
            }

            subjectsFlatMap.set(node.subject.courseCode, {
                ...node.subject,
                requisite: newRequisite,
            });
        }
    });
    const subjectsFlatList = [...subjectsFlatMap.values()];
    return subjectsFlatList;
};
