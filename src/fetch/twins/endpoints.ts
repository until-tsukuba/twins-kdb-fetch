import { TwinsFlowType, TwinsNullableFlowType } from "./types.js";
import { initialFlow } from "./flow.js";
import { generateTwinsSearchForm, generateTwinsLoginForm } from "./form.js";
import { req } from "./request.js";
import { endpoints, eventIds, flowIds } from "./statics.js";
import { assertArrayBuffer, assertRedirect, getCookieOnlyFlow, getFlowFromRes } from "./util.js";

const doFlowId = async (flowId: string, flow: TwinsNullableFlowType): Promise<TwinsFlowType> => {
    const res = await req(endpoints.square, flow, new URLSearchParams({ _flowId: flowId }));
    assertRedirect(res);
    return getFlowFromRes(res);
};

const doEventId = async (eventId: string, flow: TwinsFlowType): Promise<TwinsFlowType> => {
    const res = await req(endpoints.square, flow, new URLSearchParams({ _eventId: eventId }));
    assertRedirect(res);
    return getFlowFromRes(res);
};

export default {
    async init() {
        const res = await req(endpoints.portal, initialFlow, null);
        assertArrayBuffer(res);

        return getCookieOnlyFlow(res);
    },
    async login(flow: TwinsNullableFlowType) {
        const form = generateTwinsLoginForm();

        const res = await req(endpoints.portal, flow, form);
        assertArrayBuffer(res);

        return getCookieOnlyFlow(res);
    },
    async rsw(flow: TwinsNullableFlowType) {
        return await doFlowId(flowIds.twinsInit, flow);
    },
    async subjectInput(flow: TwinsFlowType) {
        return await doEventId(eventIds.input, flow);
    },
    async jikanwariSearch(flow: TwinsFlowType) {
        return await doEventId(eventIds.jikanwariSearch, flow);
    },
    async searchTwins(flow: TwinsFlowType, keyword: string): Promise<TwinsFlowType> {
        const form = generateTwinsSearchForm(keyword);

        const res = await req(endpoints.square, flow, form);
        assertRedirect(res);

        return getFlowFromRes(res);
    },
    async getContent(flow: TwinsNullableFlowType, encoding: "utf8" | "shift-jis"): Promise<string> {
        const res = await req(endpoints.square, flow, null);
        assertArrayBuffer(res);

        if (encoding === "utf8") {
            return Buffer.from(res.ab).toString("utf8");
        } else {
            return new TextDecoder("shift-jis").decode(Buffer.from(res.ab));
        }
    },
};
