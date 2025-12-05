import { KdBFlowType } from "./types";
import { addLayoutCookie, assertNonNullableFlow, initialFlow } from "./flow.js";
import { generateKdBFirstRequisitesForm, generateKdBLowerRequisitesForm, generateKdBSearchForm } from "./form.js";
import { req } from "./request.js";
export default {
    async init(): Promise<KdBFlowType> {
        const { flow } = await req(initialFlow, null);
        assertNonNullableFlow(flow);
        const flowWithLayout = addLayoutCookie(flow);
        return flowWithLayout;
    },
    async getLowerHierarchy(flow: KdBFlowType, requisiteCode: string | null): Promise<string> {
        const form = requisiteCode ? generateKdBLowerRequisitesForm(requisiteCode) : generateKdBFirstRequisitesForm();

        const res = await req(flow, form);
        return res.text;
    },
    async searchSubject(flow: KdBFlowType, requisiteCode: string | null, page: number): Promise<string> {
        const form = generateKdBSearchForm(requisiteCode ?? "", page);

        const res = await req(flow, form);

        return res.text;
    },
    // async outputCsv(flow: FlowType, hierarchy: Hierarchy) {
    //     const form = generateKdbSearchForm(eventIds.kdb.output, "", hierarchy);

    //     const res = await req(endpoints.square, flow, form);
    //     assertRedirect(res);

    //     return getFlowFromRes(res);
    // },
};
