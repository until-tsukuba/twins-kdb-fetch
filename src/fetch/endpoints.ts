import { FlowType, NullableFlowType } from "./types";
import { initialFlow } from "./flow.js";
import { generateTwinsSearchForm, generateKdbSearchForm, generateTwinsLoginForm } from "./form.js";
import { req } from "./request.js";
import { endpoints, eventIds, flowIds } from "./statics.js";
import { assertArrayBuffer, assertRedirect, getCookieOnlyFlow, getFlowFromRes } from "./util.js";
import { Hierarchy } from "../util/types";

const doFlowId = async (flowId: string, flow: NullableFlowType): Promise<FlowType> => {
    const res = await req(endpoints.square, flow, new URLSearchParams({ _flowId: flowId }));
    assertRedirect(res);
    return getFlowFromRes(res);
};

const doEventId = async (eventId: string, flow: FlowType): Promise<FlowType> => {
    const res = await req(endpoints.square, flow, new URLSearchParams({ _eventId: eventId }));
    assertRedirect(res);
    return getFlowFromRes(res);
};

export default {
    kdb: {
        async init(): Promise<FlowType> {
            return await doFlowId(flowIds.kdbInit, initialFlow);
        },
        async changeHierarchy(flow: FlowType, index: number, hierarchy: Hierarchy) {
            const form = generateKdbSearchForm(eventIds.kdb.changeHierarchySet, index + "", hierarchy);
            console.log("changeHierarchy form: ", form.toString());

            const res = await req(endpoints.square, flow, form);
            console.log("changeHierarchy response: ", res);
            console.log("changeHierarchy ", res.type === "arrayBuffer" && Buffer.from(res.ab).toString("utf8"));
            assertRedirect(res);

            return getFlowFromRes(res);
        },
        async searchSubject(flow: FlowType, hierarchy: Hierarchy) {
            const form = generateKdbSearchForm(eventIds.kdb.searchOpeningCourse, "", hierarchy);

            const res = await req(endpoints.square, flow, form);
            assertRedirect(res);

            return getFlowFromRes(res);
        },
        async outputCsv(flow: FlowType, hierarchy: Hierarchy) {
            const form = generateKdbSearchForm(eventIds.kdb.output, "", hierarchy);

            const res = await req(endpoints.square, flow, form);
            assertRedirect(res);

            return getFlowFromRes(res);
        },
    },
    twins: {
        async login() {
            const form = generateTwinsLoginForm();

            const res = await req(endpoints.portal, initialFlow, form);
            assertArrayBuffer(res);

            return getCookieOnlyFlow(res);
        },
        async init(flow: NullableFlowType) {
            return await doFlowId(flowIds.twinsInit, flow);
        },
        async subjectInput(flow: FlowType) {
            return await doEventId(eventIds.twins.input, flow);
        },
        async jikanwariSearch(flow: FlowType) {
            return await doEventId(eventIds.twins.jikanwariSearch, flow);
        },
        async searchTwins(flow: FlowType, keyword: string): Promise<FlowType> {
            const form = generateTwinsSearchForm(eventIds.twins.search, keyword);

            const res = await req(endpoints.square, flow, form);
            assertRedirect(res);

            return getFlowFromRes(res);
        },
    },
    async getContent(flow: FlowType, encoding: "utf8" | "shift-jis") {
        const res = await req(endpoints.square, flow, new URLSearchParams({}));
        assertArrayBuffer(res);

        if (encoding === "utf8") {
            return Buffer.from(res.ab).toString("utf8");
        } else {
            return new TextDecoder("shift-jis").decode(Buffer.from(res.ab));
        }
    },
};
