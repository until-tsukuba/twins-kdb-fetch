import { Element } from "hast";
import { ParsedHierarchyType } from "./types";
import { generateHtmlParser, isElement, isText } from "./util.js";

const isHierarchySelect = (node: Element) => {
    const id = node.properties.id;
    if (!(id && typeof id === "string")) {
        return false;
    }
    if (!id.startsWith("hierarchy")) {
        return false;
    }
    return true;
};

export const parseKdbHtml = generateHtmlParser<ParsedHierarchyType>(isHierarchySelect, (hierarchySelectList) => {
    const hierarchySelects = new Map<string, { value: string; text: string }[]>();

    for (const node of hierarchySelectList) {
        const id = node.properties.id;
        if (typeof id !== "string") {
            continue;
        }
        const k = node.children
            .filter((child) => isElement(child))
            .filter((child) => child.tagName === "option")
            .map((child) => {
                const value = child.properties.value;
                if (typeof value !== "string") {
                    return { value: "", text: "" };
                }
                const childNode = child.children[0];
                if (!(childNode && isText(childNode))) {
                    return { value: "", text: "" };
                }
                const text = childNode.value;
                return { value, text };
            })
            .filter((opt) => opt.value !== "");

        hierarchySelects.set(id, k);
    }

    return [hierarchySelects.get("hierarchy1") ?? [], hierarchySelects.get("hierarchy2") ?? [], hierarchySelects.get("hierarchy3") ?? [], hierarchySelects.get("hierarchy4") ?? [], hierarchySelects.get("hierarchy5") ?? []];
});
