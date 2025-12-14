import { Requisite } from "../util/requisite.js";
import { DfsTreeNode } from "./dfs.js";
import { SubjectNode } from "./types.js";
import { visitTree } from "./visitTree.js";

export const createTreeText = (tree: DfsTreeNode<Requisite, SubjectNode[]>) => {
    const subjectCategoryTextLines: string[] = [];
    visitTree<DfsTreeNode<Requisite, SubjectNode[]> | SubjectNode>(tree, (node, depth) => {
        if (node.type === "internal" || node.type === "leaf") {
            if (depth === 0) {
                // root node, skip
                return;
            }
            subjectCategoryTextLines.push("    ".repeat(depth - 1) + (node.node.getName() ?? "root"));
        } else if (node.type === "subject") {
            // skip
        }
    });
    const subjectCategoryText = subjectCategoryTextLines.join("\n");
    return subjectCategoryText;
};
