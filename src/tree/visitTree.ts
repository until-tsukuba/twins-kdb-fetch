import { visit } from "../util/visit.js";

export type TreeNode<C extends TreeNode<C>> = {
    readonly children: readonly C[] | null;
};
export const visitTree = <T extends TreeNode<T>>(tree: T, visitor: (node: T, depth: number, parent: T | null) => void) => {
    return visit<T, { depth: number; parent: T | null }>(
        tree,
        { depth: 0, parent: null },
        (node, from) => {
            visitor(node, from.depth, from.parent);
            return {
                depth: from.depth + 1,
                parent: node,
            };
        },
        (node) => (node.children ? node.children : []),
    );
};
