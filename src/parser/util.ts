import { CompileResults, Plugin, Processor, unified } from "unified";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
import type { Element, ElementContent, Text } from "hast";
import rehypeParse from "rehype-parse";

export const isElement = (node: Node | ElementContent): node is Element => {
    return node.type === "element";
};

export const assertChildElementLength = (node: Element, expected: number) => {
    if (node.children.filter(isElement).length !== expected) {
        throw new Error(`Invalid children length: expected ${expected}, got ${node.children.length}`);
    }
};

export const assertChildrenLength = (node: Element, expected: number) => {
    if (node.children.length !== expected) {
        throw new Error(`Invalid children length: expected ${expected}, got ${node.children.length}`);
    }
};

export function assertElementTag(node: ElementContent | undefined, expectedTag: string): asserts node is Element {
    if (!node || node.type !== "element") {
        throw new Error(`Invalid element: expected ${expectedTag}, got ${node?.type}`);
    }
    if (node.tagName !== expectedTag) {
        throw new Error(`Invalid element tag: expected ${expectedTag}, got ${node.tagName}`);
    }
}

const compareArray = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((value, index) => value === b[index]);
};

export const assertElementClass = (node: Element, expectedClass: string[]) => {
    const className = node.properties.className;
    if (!className || !Array.isArray(className) || !compareArray(className, expectedClass)) {
        throw new Error(`Invalid element class: expected ${expectedClass.join(" ")}, got ${className}`);
    }
};

export function assertTextNode(node: ElementContent | undefined): asserts node is Text {
    if (!node || node.type !== "text") {
        throw new Error(`Invalid text node: expected text, got ${node?.type}`);
    }
}

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
