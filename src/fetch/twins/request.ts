import { mergeCookie, parseCookie, stringifyCookie } from "../util.js";
import { TwinsNullableFlowType, Res } from "./types.js";
import { twinsHost } from "../../envs.js";

export const req = async (path: string, flow: TwinsNullableFlowType, requestBody: URLSearchParams | null): Promise<Res> => {
    const url = new URL(path, twinsHost);
    if (flow.flowExecutionKey) {
        if (requestBody) {
            requestBody.set("_flowExecutionKey", flow.flowExecutionKey);
        } else {
            url.searchParams.set("_flowExecutionKey", flow.flowExecutionKey);
        }
    }

    const response = await fetch(url, {
        method: requestBody ? "POST" : "GET",
        redirect: "manual",
        body: requestBody,
        headers: {
            Cookie: stringifyCookie(flow.cookie ?? null),
        },
    });
    const resCookie = parseCookie(response.headers.getSetCookie());
    const mergedCookie = mergeCookie(flow.cookie, resCookie);

    if (response.status === 302) {
        const location = response.headers.get("Location") ?? "";
        const flowExecutionKey = new URL(location, twinsHost).searchParams.get("_flowExecutionKey") ?? null;
        return {
            type: "redirect",
            flow: {
                flowExecutionKey,
                cookie: mergedCookie,
            },
        };
    } else {
        return {
            type: "arrayBuffer",
            ab: await response.arrayBuffer(),
            flow: {
                flowExecutionKey: null,
                cookie: mergedCookie,
            },
        };
    }
};
