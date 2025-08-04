// depth first search

const mapSeries = async <T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = [];
    for (const item of items) {
        results.push(await fn(item));
    }
    return results;
};

export type DfsTreeNode<N, R> =
    | {
          type: "internal";
          node: N;
          children: DfsTreeNode<N, R>[];
      }
    | {
          type: "leaf";
          node: N;
          children: R;
      };

export const dfs = async <N, R>(root: N, getChildren: (node: N) => Promise<N[]>, leafVisiter: (node: N) => Promise<R>): Promise<DfsTreeNode<N, R>> => {
    const rec = async (node: N): Promise<DfsTreeNode<N, R>> => {
        const children = await getChildren(node);
        if (children.length === 0) {
            // leaf
            const result = await leafVisiter(node);
            return {
                node: node,
                type: "leaf",
                children: result,
            };
        }
        // use mapSeries
        const childNode = await mapSeries(children, rec);
        return {
            node,
            type: "internal",
            children: childNode,
        };
    };

    return await rec(root);
};
