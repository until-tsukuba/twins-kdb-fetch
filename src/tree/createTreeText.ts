import { Hierarchy } from "../util/types";
import { DfsTreeNode } from "./dfs";
import { LeafResultNode } from "./types";
import { visitTree } from "./visitTree.js";

export const createTreeText = (tree: DfsTreeNode<Hierarchy, LeafResultNode[]>) => {
    const subjectCategoryTextLines: string[] = [];
    visitTree<DfsTreeNode<Hierarchy, LeafResultNode[]> | LeafResultNode>(tree, (node) => {
        if (node.type === "internal" || node.type === "leaf" || node.type === "sub_category") {
            if (node.node.getLength() === 0) {
                // root node, skip
                return;
            }
            subjectCategoryTextLines.push("    ".repeat(node.node.getLength() - 1) + (node.node.getLast()?.text ?? "root"));
        } else if (node.type === "subject") {
            // skip
        }
    });
    const subjectCategoryText = subjectCategoryTextLines.join("\n");
    return subjectCategoryText;
};
