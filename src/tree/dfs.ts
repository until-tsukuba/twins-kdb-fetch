// depth first search

import { mapSeries } from "../util/mapSeries.js";

export type DfsTreeNode<N, R> =
    | {
          readonly type: "internal";
          readonly node: N;
          readonly children: readonly DfsTreeNode<N, R>[];
      }
    | {
          readonly type: "leaf";
          readonly node: N;
          readonly children: R;
      };

type Serializable = {
    serialize(): string;
};

export const dfs = async <N extends Serializable, R>(root: N, getChildren: (node: N) => Promise<N[]>, leafVisiter: (node: N) => Promise<R>): Promise<DfsTreeNode<N, R>> => {
    const visited = new Map<string, DfsTreeNode<N, R>>();

    const rec = async (node: N): Promise<DfsTreeNode<N, R>> => {
        if (visited.has(node.serialize())) {
            const cached = visited.get(node.serialize());
            if (cached === undefined) {
                throw new Error("Cached value is undefined");
            }
            return cached;
        }
        const children = await getChildren(node);
        if (children.length === 0) {
            // leaf
            const result = await leafVisiter(node);
            const leafNode: DfsTreeNode<N, R> = {
                node: node,
                type: "leaf",
                children: result,
            };
            visited.set(node.serialize(), leafNode);
            return leafNode;
        }
        // use mapSeries
        const childNode = await mapSeries(children, rec);
        const internalNode: DfsTreeNode<N, R> = {
            node,
            type: "internal",
            children: childNode,
        };
        visited.set(node.serialize(), internalNode);
        return internalNode;
    };

    return await rec(root);
};
