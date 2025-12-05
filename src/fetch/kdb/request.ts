import { parseCookie, stringifyCookie } from "../util.js";
import { KdBNullableFlowType, Res } from "./types";
import { kdbHost } from "../../envs.js";
export const req = async (session: KdBNullableFlowType, requestBody: URLSearchParams | null): Promise<Res> => {
    const response = await fetch(kdbHost, {
        method: requestBody ? "POST" : "GET",
        redirect: "manual",
        body: requestBody,
        headers: requestBody
            ? {
                  "Accept-Language": "ja",
                  Cookie: stringifyCookie(session.cookie ?? null),
                  "Content-Type": "application/x-www-form-urlencoded",
                  "X-Requested-With": "XMLHttpRequest",
              }
            : {
                  "Accept-Language": "ja",
              },
    });
    const resCookie = parseCookie(response.headers.getSetCookie());

    return {
        type: "text",
        text: await response.text(),
        flow: {
            cookie: resCookie ?? session.cookie ?? null,
        },
    };
};
