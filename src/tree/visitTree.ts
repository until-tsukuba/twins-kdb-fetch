export type TreeNode<C extends TreeNode<C>> = {
    children: C[] | null;
};
export const visitTree = <T extends TreeNode<T>>(tree: T, visitor: (node: T, depth: number, parent: T | null) => void, depth: number = 0, parent: T | null = null) => {
    visitor(tree, depth, parent);
    if (tree.children) {
        for (const child of tree.children) {
            visitTree(child, visitor, depth + 1, tree);
        }
    }
};
