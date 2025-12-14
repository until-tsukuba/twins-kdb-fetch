/**
 * input: ```html
 * <ul>
 *     <li>
 *         <div class="fg-clickable">
 *             <a href="#">情報学群学群共通</a>
 *             <span class="ui-helper-hidden ut-widget-param" name="name">情報学群学群共通</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="id">120</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="type">req</span>
 *             <span class="ui-helper-hidden hdnWidgetParameterClass" name="widgetParamRequisites">120</span>
 *             <span class="ui-helper-hidden hdnLowerClass" name="hdnLower"></span>
 *         </div>
 *     </li>
 *     <li>
 *         <div class="fg-clickable">
 *             <a href="#">情報科学類</a>
 *             <span class="ui-helper-hidden ut-widget-param" name="name">情報科学類</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="id">118</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="type">req</span>
 *             <span class="ui-helper-hidden hdnWidgetParameterClass" name="widgetParamRequisites">118</span>
 *             <span class="ui-helper-hidden hdnLowerClass" name="hdnLower">true</span>
 *         </div>
 *     </li>
 *     <li>
 *         <div class="fg-clickable">
 *             <a href="#">情報メディア創成学類</a>
 *             <span class="ui-helper-hidden ut-widget-param" name="name">情報メディア創成学類</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="id">119</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="type">req</span>
 *             <span class="ui-helper-hidden hdnWidgetParameterClass" name="widgetParamRequisites">119</span>
 *             <span class="ui-helper-hidden hdnLowerClass" name="hdnLower">true</span>
 *         </div>
 *     </li>
 *     <li>
 *         <div class="fg-clickable">
 *             <a href="#">知識情報・図書館学類</a>
 *             <span class="ui-helper-hidden ut-widget-param" name="name">知識情報・図書館学類</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="id">17</span>
 *             <span class="ui-helper-hidden ut-widget-param" name="type">req</span>
 *             <span class="ui-helper-hidden hdnWidgetParameterClass" name="widgetParamRequisites">17</span>
 *             <span class="ui-helper-hidden hdnLowerClass" name="hdnLower">true</span>
 *         </div>
 *     </li>
 * </ul>
 * ```
 * output: ```js
 * [
 *   {
 *     name: "情報学群学群共通",
 *     id: "120",
 *     hasLower: false,
 *   },
 *   {
 *     name: "情報科学類",
 *     id: "118",
 *     hasLower: true,
 *   },
 *   {
 *     name: "情報メディア創成学類",
 *     id: "119",
 *     hasLower: true,
 *   },
 *   {
 *     name: "知識情報・図書館学類",
 *     id: "17",
 *     hasLower: true,
 *   },
 * ]
 * ```
 */

import { Element } from "hast";
import { assertChildElementLength, assertChildrenLength, assertElementClass, assertElementTag, assertTextNode, generateHtmlParser, isElement } from "../util.js";
import { ParsedRequisiteType } from "./types.js";

const isRequisiteLi = (node: Element) => {
    if (node.tagName !== "li") {
        return false;
    }
    return true;
};

export const parseRequisite = generateHtmlParser<ParsedRequisiteType>(isRequisiteLi, (requisiteLiList) => {
    const requisites: ParsedRequisiteType = requisiteLiList.map((liNode) => {
        try {
            assertElementTag(liNode, "li");
            assertChildElementLength(liNode, 1);
            const divNode = liNode.children.filter(isElement)[0];
            assertElementTag(divNode, "div");
            assertElementClass(divNode, ["fg-clickable"]);

            assertChildElementLength(divNode, 6);
            const [anchorNode, nameSpanNode, idSpanNode, typeSpanNode, widgetParamRequisitesSpanNode, hdnLowerSpanNode] = divNode.children.filter(isElement);

            assertElementTag(anchorNode, "a");
            assertChildrenLength(anchorNode, 1);
            const anchorChildNode = anchorNode.children[0];
            assertTextNode(anchorChildNode);
            const anchorName = anchorChildNode.value;

            assertElementTag(nameSpanNode, "span");
            assertChildrenLength(nameSpanNode, 1);
            const nameChildNode = nameSpanNode.children[0];
            assertTextNode(nameChildNode);
            const name = nameChildNode.value;

            if (name !== anchorName) {
                throw new Error(`Name mismatch: anchor name "${anchorName}" does not match span name "${name}"`);
            }

            assertElementTag(idSpanNode, "span");
            assertChildrenLength(idSpanNode, 1);
            const idChildNode = idSpanNode.children[0];
            assertTextNode(idChildNode);
            const id = idChildNode.value;

            assertElementTag(typeSpanNode, "span");
            assertChildrenLength(typeSpanNode, 1);
            const typeChildNode = typeSpanNode.children[0];
            assertTextNode(typeChildNode);
            const type = typeChildNode.value;

            if (type !== "req") {
                throw new Error(`Type mismatch: expected "req", got "${type}"`);
            }

            assertElementTag(widgetParamRequisitesSpanNode, "span");
            assertChildrenLength(widgetParamRequisitesSpanNode, 1);
            const widgetParamRequisitesChildNode = widgetParamRequisitesSpanNode.children[0];
            assertTextNode(widgetParamRequisitesChildNode);
            const widgetParamRequisites = widgetParamRequisitesChildNode.value;

            if (widgetParamRequisites !== id) {
                throw new Error(`Widget param requisites mismatch: expected "${id}", got "${widgetParamRequisites}"`);
            }

            assertElementTag(hdnLowerSpanNode, "span");
            const hasLower = (() => {
                if (hdnLowerSpanNode.children.length === 0) {
                    return false;
                }
                if (hdnLowerSpanNode.children.length > 1) {
                    throw new Error(`Invalid hdnLowerSpanNode children length: expected 0 or 1, got ${hdnLowerSpanNode.children.length}`);
                }
                const hdnLowerChildNode = hdnLowerSpanNode.children[0];
                assertTextNode(hdnLowerChildNode);
                const hdnLower = hdnLowerChildNode.value;

                if (hdnLower === "true") {
                    return true;
                }
                throw new Error(`Invalid hdnLower value: expected "true" or "", got "${hdnLower}"`);
            })();

            return {
                name,
                id,
                hasLower,
            };
        } catch (e) {
            console.error(JSON.stringify(liNode, null, 4));
            throw e;
        }
    });

    return requisites;
});
