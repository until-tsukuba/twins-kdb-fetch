import { KdBFlowType, KdBNullableFlowType } from "./types";

export const initialFlow: KdBNullableFlowType = { cookie: null };

export function assertNonNullableFlow(flow: KdBNullableFlowType): asserts flow is KdBFlowType {
    if (flow.cookie === null) {
        throw new Error("Flow cookie is null");
    }
}

export const addLayoutCookie = (flow: KdBFlowType): KdBFlowType => {
    const newCookie = new Map(flow.cookie);
    newCookie.set("kdbOuterLayout", "");
    return {
        cookie: newCookie,
    };
};
