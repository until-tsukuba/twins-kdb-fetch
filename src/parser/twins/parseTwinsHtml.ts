import { Element } from "hast";
import { assertChildElementLength, assertChildrenLength, assertElementTag, assertTextNode, generateHtmlParser, isElement } from "../util.js";
import { ParsedTwinsTableType } from "./types.js";

const isMainTable = (node: Element) => {
    if (node.tagName !== "table") {
        return false;
    }
    if (!Array.isArray(node.properties.className)) {
        return false;
    }
    if (node.properties.className.length === 0) {
        return false;
    }
    if (node.properties.className[0] !== "normal") {
        return false;
    }
    return true;
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

    const thead = mainTable.children.filter(isElement)[0];
    assertElementTag(thead, "thead");

    const tbody = mainTable.children.filter(isElement)[1];
    assertElementTag(tbody, "tbody");

    const trToStringList = (row: Element | undefined) => {
        assertElementTag(row, "tr");
        return row.children.filter(isElement).map((cell) => {
            if (cell.tagName !== "th" && cell.tagName !== "td") {
                throw new Error("The <tr> elements must contain <th> or <td> elements.");
            }
            if (cell.children.length === 1) {
                const childNode = cell.children[0];
                assertTextNode(childNode);
                return childNode.value.trim();
            } else {
                const childNode = cell.children.filter(isElement)[0];
                assertElementTag(childNode, "a");
                const onclick = childNode.properties.onClick;
                if (typeof onclick !== "string") {
                    console.error("childNode", childNode);
                    throw new Error("The <a> element must have an onClick property.");
                }
                assertChildrenLength(childNode, 1);
                const text = childNode.children[0];
                assertTextNode(text);

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
