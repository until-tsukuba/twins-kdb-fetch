import { Element } from "../types.js";
import { assertChildElementLength, assertChildrenLength, assertElementClass, assertElementTag, assertTextNode, generateHtmlParser, getAttr, isElement } from "../util.js";
import { ParsedTwinsTableType } from "./types.js";

const isMainTable = (node: Element) => {
    try {
        assertElementTag(node, "table");
        assertElementClass(node, ["normal"]);
        return true;
    } catch {
        return false;
    }
};

export const parseTwinsHtml = generateHtmlParser<ParsedTwinsTableType>(isMainTable, (mainTableList) => {
    const mainTable = mainTableList[0];
    if (!mainTable) {
        throw new Error("No main table found in the HTML.");
    }
    if (mainTableList.length > 1) {
        throw new Error("Multiple main tables found in the HTML.");
    }

    assertChildElementLength(mainTable, 2);

    const thead = mainTable.childNodes.filter(isElement)[0];
    assertElementTag(thead, "thead");

    const tbody = mainTable.childNodes.filter(isElement)[1];
    assertElementTag(tbody, "tbody");

    const trToStringList = (row: Element | undefined) => {
        assertElementTag(row, "tr");
        return row.childNodes.filter(isElement).map((cell) => {
            if (cell.tagName !== "th" && cell.tagName !== "td") {
                throw new Error("The <tr> elements must contain <th> or <td> elements.");
            }
            if (cell.childNodes.length === 1) {
                const childNode = cell.childNodes[0];
                assertTextNode(childNode);
                return childNode.value.trim();
            } else {
                const childNode = cell.childNodes.filter(isElement)[0];
                assertElementTag(childNode, "a");
                const onclick = getAttr(childNode, "onclick");
                if (typeof onclick !== "string") {
                    console.error("childNode", childNode);
                    throw new Error("The <a> element must have an onclick property.");
                }
                assertChildrenLength(childNode, 1);
                const text = childNode.childNodes[0];
                assertTextNode(text);

                return {
                    text: text.value.trim(),
                    onclick: onclick,
                };
            }
        });
    };

    const header = trToStringList(thead.childNodes.filter(isElement)[0]);
    const body = tbody.childNodes.filter(isElement).map(trToStringList);

    return {
        head: header,
        body: body,
    };
});
