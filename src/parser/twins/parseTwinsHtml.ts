import { Element } from "hast";
import { generateHtmlParser, isAnchor, isElement, isText } from "../util.js";
import { ParsedTwinsTableType } from "./types.js";

const isMainTable = (node: Element) => {
    return node.tagName === "table" && Array.isArray(node.properties.className) && node.properties.className[0] === "normal";
};

export const parseTwinsHtml = generateHtmlParser<ParsedTwinsTableType>(isMainTable, (mainTableList) => {
    const mainTable = mainTableList[0];
    if (!mainTable) {
        throw new Error("No main table found in the HTML.");
    }
    if (mainTableList.length > 1) {
        throw new Error("Multiple main tables found in the HTML.");
    }

    const thead = mainTable.children.filter(isElement)[0];
    if (!thead || thead.tagName !== "thead") {
        throw new Error("The first child of the main table is not a <thead> element.");
    }
    const tbody = mainTable.children.filter(isElement)[1];
    if (!tbody || tbody.tagName !== "tbody") {
        throw new Error("The second child of the main table is not a <tbody> element.");
    }
    const trToStringList = (row: Element | undefined) => {
        if (!row || row.tagName !== "tr") {
            throw new Error("The children of the <tbody> or <thead> must be <tr> elements.");
        }
        return row.children.filter(isElement).map((cell) => {
            if (cell.tagName !== "th" && cell.tagName !== "td") {
                throw new Error("The <tr> elements must contain <th> or <td> elements.");
            }
            if (cell.children.length === 1) {
                const childNode = cell.children[0];
                if (!childNode || !isText(childNode)) {
                    throw new Error("The <th> or <td> elements must contain a text node or an <a> element.");
                }
                return childNode.value.trim();
            } else {
                const childNode = cell.children.filter(isElement)[0];
                if (!childNode || !isAnchor(childNode)) {
                    throw new Error("The <th> or <td> elements must contain a text node or an <a> element.");
                }
                const onclick = childNode.properties.onClick;
                if (typeof onclick !== "string") {
                    console.error("childNode", childNode);
                    throw new Error("The <a> element must have an onClick property.");
                }
                const text = childNode.children[0];
                if (!text || !isText(text)) {
                    throw new Error("The <a> element must contain a text node.");
                }
                return {
                    text: text.value.trim(),
                    onclick: onclick,
                };
            }
        });
    };

    const header = trToStringList(thead.children.filter(isElement)[0]);
    const body = tbody.children.filter(isElement).map(trToStringList);

    return {
        head: header,
        body: body,
    };
});
