import { assertCookieOnlyFlow, assertNonNullableFlow } from "./flow";
import { Res, ResArrayBuffer, ResRedirect, TwinsCookieOnlyFlowType, TwinsFlowType } from "./types";

export function assertRedirect(res: Res): asserts res is ResRedirect {
    if (res.type !== "redirect") {
        throw new Error("Expected redirect response");
    }
}

export const getFlowFromRes = (res: Res): TwinsFlowType => {
    assertNonNullableFlow(res.flow);
    return {
        flowExecutionKey: res.flow.flowExecutionKey,
        cookie: res.flow.cookie,
    };
};

export const getCookieOnlyFlow = (res: Res): TwinsCookieOnlyFlowType => {
    assertCookieOnlyFlow(res.flow);
    if (!res.flow.cookie) {
        throw new Error("Cookie is missing in response");
    }
    return {
        flowExecutionKey: res.flow.flowExecutionKey,
        cookie: res.flow.cookie,
    };
};

export function assertArrayBuffer(res: Res): asserts res is ResArrayBuffer {
    if (res.type !== "arrayBuffer") {
        throw new Error("Expected arrayBuffer response");
    }
}
