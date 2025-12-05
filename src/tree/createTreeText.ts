import { Requisite } from "../util/types";
import { DfsTreeNode } from "./dfs";
import { LeafResultNode } from "./types";
import { visitTree } from "./visitTree.js";

export const createTreeText = (tree: DfsTreeNode<Requisite, LeafResultNode[]>) => {
    const subjectCategoryTextLines: string[] = [];
    visitTree<DfsTreeNode<Requisite, LeafResultNode[]> | LeafResultNode>(tree, (node, depth) => {
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
