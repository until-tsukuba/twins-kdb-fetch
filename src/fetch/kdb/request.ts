import { parseCookie, stringifyCookie } from "../util.js";
import { KdBNullableFlowType, Res, ResArrayBuffer, ResText } from "./types.js";
import { kdbHost } from "../../envs.js";

const createGetHeader = (): Headers => {
    return new Headers({
        "Accept-Language": "ja",
    });
};

const createPostHeader = (session: KdBNullableFlowType): Headers => {
    return new Headers({
        "Accept-Language": "ja",
        Cookie: stringifyCookie(session.cookie ?? null),
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
    });
};

export const req = async <M extends "GET" | "POST">(method: M, session: KdBNullableFlowType, requestBody: M extends "POST" ? URLSearchParams : null): Promise<Res> => {
    const header = method === "POST" ? createPostHeader(session) : createGetHeader();
    const response = await fetch(kdbHost, {
        method: method,
        redirect: "manual",
        body: requestBody,
        headers: header,
    });
    const resCookie = parseCookie(response.headers.getSetCookie());

    return {
        res: response,
        cookie: resCookie ?? null,
    };
};

export const reqArrayBuffer = async (session: KdBNullableFlowType, requestBody: URLSearchParams | null): Promise<ResArrayBuffer> => {
    const method = requestBody ? "POST" : "GET";
    const response = await req(method, session, requestBody);
    const ab = await response.res.arrayBuffer();

    return {
        type: "arrayBuffer",
        ab,
        flow: {
            cookie: response.cookie,
        },
    };
};

export const reqText = async (session: KdBNullableFlowType, requestBody: URLSearchParams | null): Promise<ResText> => {
    const method = requestBody ? "POST" : "GET";
    const response = await req(method, session, requestBody);
    const text = await response.res.text();

    return {
        type: "text",
        text,
        flow: {
            cookie: response.cookie,
        },
    };
};
