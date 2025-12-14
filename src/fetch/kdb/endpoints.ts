import { KdBFlowType } from "./types.js";
import { addLayoutCookie, assertNonNullableFlow, initialFlow } from "./flow.js";
import { generateKdBCsvDownloadForm, generateKdBFirstRequisitesForm, generateKdBLowerRequisitesForm } from "./form.js";
import { reqArrayBuffer, reqText } from "./request.js";

export default {
    async init(): Promise<KdBFlowType> {
        const { flow } = await reqText(initialFlow, null);
        assertNonNullableFlow(flow);
        const flowWithLayout = addLayoutCookie(flow);
        return flowWithLayout;
    },
    async getLowerHierarchy(flow: KdBFlowType, requisiteCode: string | null): Promise<string> {
        const form = requisiteCode ? generateKdBLowerRequisitesForm(requisiteCode) : generateKdBFirstRequisitesForm();

        const res = await reqText(flow, form);
        return res.text;
    },
    async outputCsv(flow: KdBFlowType, requisiteCode: string | null) {
        const form = generateKdBCsvDownloadForm(requisiteCode ?? "");

        const res = await reqArrayBuffer(flow, form);
        return new TextDecoder("shift-jis").decode(Buffer.from(res.ab));
    },
};
