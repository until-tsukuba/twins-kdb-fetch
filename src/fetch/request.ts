import { parseCookie, stringifyCookie } from "./util.js";
import { NullableFlowType, Res } from "./types";

const host = "https://kdb.tsukuba.ac.jp";

export const req = async (path: string, flow: NullableFlowType, requestBody: URLSearchParams): Promise<Res> => {
    if (flow.flowExecutionKey) {
        requestBody.set("_flowExecutionKey", flow.flowExecutionKey);
    }

    const response = await fetch(new URL(path, host), {
        method: "POST",
        redirect: "manual",
        body: requestBody,
        headers: {
            Cookie: stringifyCookie(flow.cookie ?? null),
        },
    });
    const resCookie = parseCookie(response.headers.getSetCookie());

    if (response.status === 302) {
        const location = response.headers.get("Location") ?? "";
        const flowExecutionKey = new URL(location, host).searchParams.get("_flowExecutionKey") ?? null;
        return {
            type: "redirect",
            flow: {
                flowExecutionKey,
                cookie: resCookie ?? flow.cookie ?? null,
            },
        };
    } else {
        return {
            type: "arrayBuffer",
            ab: await response.arrayBuffer(),
            flow: {
                flowExecutionKey: null,
                cookie: resCookie ?? flow.cookie ?? null,
            },
        };
    }
};
