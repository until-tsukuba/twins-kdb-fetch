import { TwinsFlowType, TwinsNullableFlowType, TwinsCookieOnlyFlowType } from "./types";

export const initialFlow: TwinsNullableFlowType = { flowExecutionKey: null, cookie: null };

export function assertNonNullableFlow(flow: TwinsNullableFlowType): asserts flow is TwinsFlowType {
    if (flow.flowExecutionKey === null || flow.cookie === null) {
        throw new Error("Flow execution key or cookie is null");
    }
}

export function assertCookieOnlyFlow(flow: TwinsNullableFlowType): asserts flow is TwinsCookieOnlyFlowType {
    if (flow.cookie === null) {
        throw new Error("Flow cookie is null");
    }
}
