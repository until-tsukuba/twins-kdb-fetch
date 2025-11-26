import { CookieOnlyFlowType, CookieType, FlowType, NullableFlowType } from "./types";
import { Res, ResArrayBuffer, ResRedirect } from "./types";

export const parseCookie = (cookies: string[]): CookieType | null => {
    const map = new Map(
        cookies.map((c) => {
            const p = c.split(";")[0]?.trim().split("=");
            return [p?.[0] ?? "", p?.[1] ?? ""];
        }),
    );

    const JSESSIONID = map.get("JSESSIONID");
    const kdbTwins = map.get("kdb-twins");

    if (!JSESSIONID || !kdbTwins) {
        return null;
    }

    return {
        JSESSIONID,
        "kdb-twins": kdbTwins,
    };
};

export const stringifyCookie = (cookies: CookieType | null): string => {
    if (!cookies) {
        return "";
    }
    return [...Object.entries(cookies)].map(([key, value]) => `${key}=${value}`).join("; ");
};

const isFlowType = (obj: NullableFlowType): obj is FlowType => {
    return obj.flowExecutionKey !== null && obj.cookie !== null;
};

export function assertRedirect(res: Res): asserts res is ResRedirect {
    if (res.type !== "redirect") {
        throw new Error("Expected redirect response");
    }
}

export const getFlowFromRes = (res: Res): FlowType => {
    if (!isFlowType(res.flow)) {
        throw new Error("Flow execution key or cookie is missing in redirect response");
    }
    return {
        flowExecutionKey: res.flow.flowExecutionKey,
        cookie: res.flow.cookie,
    };
};

export const getCookieOnlyFlow = (res: Res): CookieOnlyFlowType => {
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
