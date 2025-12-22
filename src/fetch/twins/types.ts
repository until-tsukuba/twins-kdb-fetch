import { CookieType } from "../types.js";

export type TwinsFlowType = {
    cookie: CookieType;
    flowExecutionKey: string;
};

export type TwinsNullableFlowType = {
    cookie: CookieType | null;
    flowExecutionKey: string | null;
};
export type TwinsCookieOnlyFlowType = {
    cookie: CookieType;
    flowExecutionKey: string | null;
};

export type ResRedirect = {
    type: "redirect";
    flow: TwinsNullableFlowType;
};
export type ResArrayBuffer = {
    type: "arrayBuffer";
    ab: ArrayBuffer;
    flow: TwinsNullableFlowType;
};
export type Res = ResRedirect | ResArrayBuffer;
