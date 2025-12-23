export const visit = <T, P>(tree: T, from: P, visitor: (node: T, from: P) => P, getChildren: (node: T) => readonly T[]) => {
    const nextFrom = visitor(tree, from);
    const children = getChildren(tree);
    for (const child of children) {
        visit(child, nextFrom, visitor, getChildren);
    }
};
