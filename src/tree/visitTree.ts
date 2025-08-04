export type TreeNode<C extends TreeNode<C>> = {
    children: C[] | null;
};
export const visitTree = <T extends TreeNode<T>>(tree: T, visitor: (node: T) => void) => {
    visitor(tree);
    if (tree.children) {
        for (const child of tree.children) {
            visitTree(child, visitor);
        }
    }
};
