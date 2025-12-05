/**
 * input: ```html
 * <table class="ut-list ut-result ut-list-even" style="table-layout:fixed; margin-top:-1px;" e="GA18212" se="0">
 *     <tr>
 *         <td class="ut-list-content">
 *             <p class="ut-break-word ut-course">GA18212</p>
 *         </td>
 *         <td class="ut-list-content ut-preview-syllabus" c="GA18212" sc="0">
 *             <p class="ut-break-word ut-title">プログラミング入門A</p>
 *         </td>
 *         <td class="ut-list-content ut-numeric">
 *             <p class="ut-break-word ut-style">
 *                 <span s="2" rel="temp">2</span>
 *             </p>
 *         </td>
 *         <td class="ut-list-content ut-numeric">
 *             <p class="ut-break-word ut-credit">2.0</p>
 *         </td>
 *         <td class="ut-list-content ut-numeric">
 *             <p class="ut-break-word ut-grade">1</p>
 *         </td>
 *         <td class="ut-list-content">
 *             <p class="ut-break-word ut-term">秋AB</p>
 *         </td>
 *         <td class="ut-list-content">
 *             <p class="ut-break-word ut-day">木5,6</p>
 *         </td>
 *         <td class="ut-list-content">
 *             <p class="ut-break-word ut-agent">新城 靖,アランニャ, クラウス,Bou Savong</p>
 *         </td>
 *         <td class="ut-list-content ut-clickable">
 *             <p class="ut-break-word ut-body">プログラミングの有…</p>
 *         </td>
 *         <td class="ut-list-content">
 *             <p class="ut-break-word ut-remark">情報科学類生および総合学域群生(情報科学類への移行希望者)優先。定員を超過した場合は履修調整をする場合がある。履修希望者は4月~秋A開始の専門導入科目の事前登録期限までににWEB Formで登録すること。FormのURLはシラバスに掲載される。同一年度でのプログラミング入門A(GA18212)とプログラミング入門B(GA18312)の両方の履修を前提とする。<br />
 * 対面(オンライン併用型)<br />
 * 反転授業の形態で行う。詳細はシラバスの「学修時間の割当・授業外における学修方法」参照。2020年度までに開設された「プログラミング入門」(GA18112)または2018年度 までに開設された「プログラミング入門A・B」(GB10664,GB10684)の単位を修得 した者の履修は認めない。</p>
 *         </td>
 *         <td class="ut-list-content ut-auditor-clickable" style="text-align:center;">
 *             <p class="ut-break-word ut-auditor">×</p>
 *             <input type="hidden" class="hdnReasonClass" value="正規生に対しても受講制限をしているため" />
 *         </td>
 *     </tr>
 * </table>
 * ```
 * output: ```js
 * [
 *     {
 *         "code": "GA18212",
 *         "title": "プログラミング入門A",
 *         "hasSyllabusLink": true,
 *         "style": "2",
 *         "credit": "2.0",
 *         "grade": "1",
 *         "term": "秋AB",
 *         "day": "木5,6",
 *         "agent": "新城 靖,アランニャ, クラウス,Bou Savong",
 *         "body": "プログラミングの有…",
 *         "remark": "情報科学類生および総合学域群生(情報科学類への移行希望者)優先。定員を超過した場合は履修調整をする場合がある。履修希望者は4月~秋A開始の専門導入科目の事前登録期限までににWEB Formで登録すること。FormのURLはシラバスに掲載される。同一年度でのプログラミング入門A(GA18212)とプログラミング入門B(GA18312)の両方の履修を前提とする。\n対面(オンライン併用型)\n反転授業の形態で行う。詳細はシラバスの「学修時間の割当・授業外における学修方法」参照。2020年度までに開設された「プログラミング入門」(GA18112)または2018年度 までに開設された「プログラミング入門A・B」(GB10664,GB10684)の単位を修得 した者の履修は認めない。",
 *         "auditorReason": null
 *     }
 * ]
 * ```
 *
 *
 */

import { Element, ElementContent, Text } from "hast";
import { generateHtmlParser } from "../util";
import { ParsedSearchResultType } from "./types";
import { year } from "../../envs";

const isElement = (node: ElementContent): node is Element => {
    return node.type === "element";
};

const assertChildElementLength = (node: Element, expected: number) => {
    if (node.children.filter(isElement).length !== expected) {
        throw new Error(`Invalid children length: expected ${expected}, got ${node.children.length}`);
    }
};

const assertChildrenLength = (node: Element, expected: number) => {
    if (node.children.length !== expected) {
        throw new Error(`Invalid children length: expected ${expected}, got ${node.children.length}`);
    }
};

function assertElementTag(node: ElementContent | undefined, expectedTag: string): asserts node is Element {
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

const assertElementProp = (node: Element, prop: string, expectedValue: string) => {
    const actualValue = node.properties[prop];
    if (actualValue !== expectedValue) {
        throw new Error(`Invalid element property ${prop}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`);
    }
};

const assertElementRel = (node: Element, expectedRel: string[]) => {
    const actualValue = node.properties.rel;
    if (!actualValue || !Array.isArray(actualValue) || !compareArray(actualValue, expectedRel)) {
        throw new Error(`Invalid element property rel: expected ${JSON.stringify(expectedRel)}, got ${JSON.stringify(actualValue)}`);
    }
};

const assertElementClass = (node: Element, expectedClass: string[]) => {
    const className = node.properties.className;
    if (!className || !Array.isArray(className) || !compareArray(className, expectedClass)) {
        throw new Error(`Invalid element class: expected ${expectedClass.join(" ")}, got ${className}`);
    }
};

const assertElementHasClass = (node: Element, expectedClass: string[]) => {
    const className = node.properties.className;
    if (!className || !Array.isArray(className) || expectedClass.some((cls) => !className.includes(cls))) {
        throw new Error(`Invalid element class: expected ${expectedClass.join(" ")}, got ${className}`);
    }
};

function assertTextNode(node: ElementContent | undefined): asserts node is Text {
    if (!node || node.type !== "text") {
        throw new Error(`Invalid text node: expected text, got ${node?.type}`);
    }
}

const parseTextLikeNodes = (nodes: ElementContent[]): string => {
    const nodeTexts: string[] = nodes.map((node) => {
        if (node.type === "text") {
            return node.value.trim();
        }
        if (node.type === "element" && node.tagName === "br") {
            return "\n";
        }
        throw new Error(`Invalid node type: expected text or br, got ${node.type}`);
    });
    return nodeTexts.join("");
};

const parseOptionalTextNodes = (nodes: ElementContent[]): string | null => {
    if (nodes.length === 0) {
        return null;
    }
    if (nodes.length !== 1) {
        throw new Error(`Invalid nodes length: expected 0 or 1, got ${nodes.length}`);
    }
    const node = nodes[0];
    if (!node || node.type !== "text") {
        throw new Error(`Invalid node type: expected text, got ${node?.type}`);
    }
    return node.value;
};

const isSearchResultRecordTable = (node: Element) => {
    if (node.tagName !== "table") {
        return false;
    }
    return true;
};

export const parseSearchResultHtml = generateHtmlParser<ParsedSearchResultType>(isSearchResultRecordTable, (searchResultTableList) => {
    const searchResult: ParsedSearchResultType = searchResultTableList.map((tableNode) => {
        assertElementTag(tableNode, "table");
        assertChildElementLength(tableNode, 1);
        assertElementHasClass(tableNode, ["ut-list"]);
        assertElementProp(tableNode, "se", "0");

        const tbodyNode = tableNode.children.filter(isElement)[0];
        assertElementTag(tbodyNode, "tbody");

        const trNode = tbodyNode.children.filter(isElement)[0];
        assertElementTag(trNode, "tr");

        assertChildElementLength(trNode, 11);
        const [idOuterNode, titleOuterNode, styleOuterNode, creditOuterNode, gradeOuterNode, termOuterNode, dayOuterNode, agentOuterNode, bodyOuterNode, remarkOuterNode, auditorOuterNode] = trNode.children.filter(isElement);

        assertElementTag(idOuterNode, "td");
        assertElementClass(idOuterNode, ["ut-list-content"]);
        assertChildElementLength(idOuterNode, 1);
        const idInnerNode = idOuterNode.children.filter(isElement)[0];
        assertElementTag(idInnerNode, "p");
        assertElementClass(idInnerNode, ["ut-break-word", "ut-course"]);
        assertChildrenLength(idInnerNode, 1);
        const idTextNode = idInnerNode.children[0];
        assertTextNode(idTextNode);
        const id = idTextNode.value;

        try {
            assertElementProp(tableNode, "e", id);

            assertElementTag(titleOuterNode, "td");
            const syllabusLatestLink = (() => {
                try {
                    assertElementClass(titleOuterNode, ["ut-list-content", "ut-preview-syllabus"]);
                    assertElementProp(titleOuterNode, "sc", "0");
                    assertElementProp(titleOuterNode, "c", id);
                    return `https://kdb.tsukuba.ac.jp/syllabi/${year}/${id}/jpn/0/`;
                } catch {
                    assertElementClass(titleOuterNode, ["ut-list-content"]);
                    return null;
                }
            })();
            assertChildElementLength(titleOuterNode, 1);
            const titleInnerNode = titleOuterNode.children.filter(isElement)[0];
            assertElementTag(titleInnerNode, "p");
            assertElementClass(titleInnerNode, ["ut-break-word", "ut-title"]);
            assertChildrenLength(titleInnerNode, 1);
            const titleTextNode = titleInnerNode.children[0];
            assertTextNode(titleTextNode);
            const title = titleTextNode.value;

            assertElementTag(styleOuterNode, "td");
            assertElementClass(styleOuterNode, ["ut-list-content", "ut-numeric"]);
            assertChildElementLength(styleOuterNode, 1);
            const styleInnerNode = styleOuterNode.children.filter(isElement)[0];
            assertElementTag(styleInnerNode, "p");
            assertElementClass(styleInnerNode, ["ut-break-word", "ut-style"]);
            assertChildElementLength(styleInnerNode, 1);
            const styleSpanNode = styleInnerNode.children.filter(isElement)[0];
            assertElementTag(styleSpanNode, "span");
            assertElementRel(styleSpanNode, ["temp"]);
            assertChildrenLength(styleSpanNode, 1);
            const styleTextNode = styleSpanNode.children[0];
            assertTextNode(styleTextNode);
            const style = styleTextNode.value;

            assertElementProp(styleSpanNode, "s", style);

            assertElementTag(creditOuterNode, "td");
            assertElementClass(creditOuterNode, ["ut-list-content", "ut-numeric"]);
            assertChildElementLength(creditOuterNode, 1);
            const creditInnerNode = creditOuterNode.children.filter(isElement)[0];
            assertElementTag(creditInnerNode, "p");
            assertElementClass(creditInnerNode, ["ut-break-word", "ut-credit"]);
            assertChildrenLength(creditInnerNode, 1);
            const creditTextNode = creditInnerNode.children[0];
            assertTextNode(creditTextNode);
            const credit = creditTextNode.value;

            assertElementTag(gradeOuterNode, "td");
            assertElementClass(gradeOuterNode, ["ut-list-content", "ut-numeric"]);
            assertChildElementLength(gradeOuterNode, 1);
            const gradeInnerNode = gradeOuterNode.children.filter(isElement)[0];
            assertElementTag(gradeInnerNode, "p");
            assertElementClass(gradeInnerNode, ["ut-break-word", "ut-grade"]);
            assertChildrenLength(gradeInnerNode, 1);
            const gradeTextNode = gradeInnerNode.children[0];
            assertTextNode(gradeTextNode);
            const grade = gradeTextNode.value;

            assertElementTag(termOuterNode, "td");
            assertElementClass(termOuterNode, ["ut-list-content"]);
            assertChildElementLength(termOuterNode, 1);
            const termInnerNode = termOuterNode.children.filter(isElement)[0];
            assertElementTag(termInnerNode, "p");
            assertElementClass(termInnerNode, ["ut-break-word", "ut-term"]);
            const term = parseTextLikeNodes(termInnerNode.children);

            assertElementTag(dayOuterNode, "td");
            assertElementClass(dayOuterNode, ["ut-list-content"]);
            assertChildElementLength(dayOuterNode, 1);
            const dayInnerNode = dayOuterNode.children.filter(isElement)[0];
            assertElementTag(dayInnerNode, "p");
            assertElementClass(dayInnerNode, ["ut-break-word", "ut-day"]);
            const day = parseTextLikeNodes(dayInnerNode.children);

            assertElementTag(agentOuterNode, "td");
            assertElementClass(agentOuterNode, ["ut-list-content"]);
            assertChildElementLength(agentOuterNode, 1);
            const agentInnerNode = agentOuterNode.children.filter(isElement)[0];
            assertElementTag(agentInnerNode, "p");
            assertElementClass(agentInnerNode, ["ut-break-word", "ut-agent"]);
            const agent = parseTextLikeNodes(agentInnerNode.children);

            assertElementTag(bodyOuterNode, "td");
            assertElementClass(bodyOuterNode, ["ut-list-content", "ut-clickable"]);
            assertChildElementLength(bodyOuterNode, 1);
            const bodyInnerNode = bodyOuterNode.children.filter(isElement)[0];
            assertElementTag(bodyInnerNode, "p");
            assertElementClass(bodyInnerNode, ["ut-break-word", "ut-body"]);
            const body = (() => {
                // AC53082
                try {
                    return parseOptionalTextNodes(bodyInnerNode.children);
                } catch (error) {
                    if (id === "AC53082" || id === "AC53092") {
                        return null;
                    }
                    console.error(bodyInnerNode);
                    throw error;
                    // return null;
                }
            })();

            assertElementTag(remarkOuterNode, "td");
            assertElementClass(remarkOuterNode, ["ut-list-content"]);
            assertChildElementLength(remarkOuterNode, 1);
            const remarkInnerNode = remarkOuterNode.children.filter(isElement)[0];
            assertElementTag(remarkInnerNode, "p");
            assertElementClass(remarkInnerNode, ["ut-break-word", "ut-remark"]);
            const remark = parseTextLikeNodes(remarkInnerNode.children);

            assertElementTag(auditorOuterNode, "td");
            assertElementClass(auditorOuterNode, ["ut-list-content", "ut-auditor-clickable"]);
            assertChildElementLength(auditorOuterNode, 2);
            const auditorInnerNode = auditorOuterNode.children.filter(isElement)[0];
            assertElementTag(auditorInnerNode, "p");
            assertElementClass(auditorInnerNode, ["ut-break-word", "ut-auditor"]);

            const auditor = ((aud) => {
                if (aud.children.length === 0) {
                    return null;
                }
                assertChildrenLength(aud, 1);
                const audChildNode = aud.children[0];
                assertTextNode(audChildNode);
                return audChildNode.value;
            })(auditorInnerNode);

            const auditorReasonNode = auditorOuterNode.children.filter(isElement)[1];
            assertElementTag(auditorReasonNode, "input");
            assertElementClass(auditorReasonNode, ["hdnReasonClass"]);
            assertElementProp(auditorReasonNode, "type", "hidden");
            const auditorReason = auditorReasonNode.properties.value;
            if (typeof auditorReason !== "string") {
                throw new Error(`Invalid auditor reason value type: expected string, got ${typeof auditorReason}`);
            }
            if (auditor === null && auditorReason !== "") {
                throw new Error(`Inconsistent auditor reason: auditor is true but reason is "${auditorReason}"`);
            }

            const finalAuditorReason = auditor ? null : auditorReason;

            return {
                code: id,
                title,
                syllabusLatestLink,
                style,
                credit,
                grade,
                term,
                day,
                agent,
                body,
                remark,
                auditor,
                auditorReason: finalAuditorReason,
            };
        } catch (e) {
            console.error("falled id:", id);
            throw e;
        }
    });

    return searchResult;
});

export const parseSearchResult = (htmlPart: string) => {
    return parseSearchResultHtml(`<div>${htmlPart}</div>`);
};
