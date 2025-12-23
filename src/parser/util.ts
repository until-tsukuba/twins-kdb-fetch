import * as parse5 from "parse5";
import { visit } from "../util/visit.js";
import { ChildNode, Element, Node, TextNode } from "./types.js";

export const isElement = (node: Node): node is Element => {
    return "tagName" in node;
};

export const assertChildElementLength = (node: Element, expected: number) => {
    if (node.childNodes.filter(isElement).length !== expected) {
        throw new Error(`Invalid children length: expected ${expected}, got ${node.childNodes.length}`);
    }
};

export const assertChildrenLength = (node: Element, expected: number) => {
    if (node.childNodes.length !== expected) {
        throw new Error(`Invalid children length: expected ${expected}, got ${node.childNodes.length}`);
    }
};

export function assertElementTag(node: Node | undefined, expectedTag: string): asserts node is Element {
    if (!node) {
        throw new Error(`Invalid element: expected ${expectedTag}, got undefined`);
    }
    if (!isElement(node)) {
        throw new Error(`Invalid element: expected ${expectedTag}, got ${node?.nodeName}`);
    }
    if (node.tagName !== expectedTag) {
        throw new Error(`Invalid element tag: expected ${expectedTag}, got ${node.tagName}`);
    }
}

const compareArray = <T>(a: readonly T[], b: readonly T[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((value, index) => value === b[index]);
};

export const getAttr = (node: Element, attrName: string): string | null => {
    const attr = node.attrs.find((a) => a.name === attrName);
    if (!attr) {
        return null;
    }
    return attr.value;
};

export const assertElementClass = (node: Element, expectedClass: readonly string[]) => {
    const className = getAttr(node, "class")
        ?.split(" ")
        .filter((s) => s.length > 0);
    if (!className || !Array.isArray(className) || !compareArray(className, expectedClass)) {
        throw new Error(`Invalid element class: expected ${expectedClass.join(" ")}, got ${className}`);
    }
};

export function assertTextNode(node: ChildNode | undefined): asserts node is TextNode {
    if (!node) {
        throw new Error(`Invalid text node: expected text, got undefined`);
    }
    if (node.nodeName !== "#text") {
        throw new Error(`Invalid text node: expected text, got ${node?.nodeName}`);
    }
}

export const generateHtmlParser = <T>(cond: (elem: Element) => boolean, parseList: (elem: Element[]) => T) => {
    return async (htmlString: string): Promise<T> => {
        const result = parse5.parseFragment(htmlString);

        const elemList: Element[] = [];
        visit<Node, void>(
            result,
            undefined,
            (node) => {
                if (!isElement(node)) {
                    return;
                }
                if (cond(node)) {
                    elemList.push(node);
                }
            },
            (node) => ("childNodes" in node ? node.childNodes : []),
        );
        return parseList(elemList);
    };
};
