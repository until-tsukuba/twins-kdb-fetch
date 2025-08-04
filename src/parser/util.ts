import { unified } from "unified";
import { CompileResults, Node, Plugin, Processor } from "unified/lib";
import { visit } from "unist-util-visit";
import { Element, ElementContent, Text } from "hast";
import rehypeParse from "rehype-parse";

export const isElement = (node: Node | ElementContent): node is Element => {
    return node.type === "element";
};

export const isText = (node: Node): node is Text => {
    return node.type === "text";
};

export const isAnchor = (node: Element) => {
    return node.tagName === "a";
};

export const generateHtmlParser = <T extends CompileResults>(cond: (elem: Element) => boolean, parseList: (elem: (Element & Node)[]) => T) => {
    // TypeScript はあまり使えないので、ここでは妥協
    function Plugin(this: Processor) {
        this.compiler = function (tree: Node): T {
            const elemList: (Element & Node)[] = [];
            visit(tree, (node) => {
                if (!isElement(node)) {
                    return;
                }
                if (cond(node)) {
                    elemList.push(node);
                }
            });
            return parseList(elemList);
        };
    }
    return async (htmlString: string): Promise<T> => {
        const vfile = await unified()
            .use(rehypeParse, { fragment: true })
            .use(Plugin as Plugin<[], Node, T>)
            .process(htmlString);
        return vfile.result as T;
    };
};
