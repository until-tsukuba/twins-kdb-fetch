import { CookieType } from "../types.js";

export type TwinsFlowType = {
    readonly cookie: CookieType;
    readonly flowExecutionKey: string;
};

export type TwinsNullableFlowType = {
    readonly cookie: CookieType | null;
    readonly flowExecutionKey: string | null;
};
export type TwinsCookieOnlyFlowType = {
    readonly cookie: CookieType;
    readonly flowExecutionKey: string | null;
};

export type ResRedirect = {
    readonly type: "redirect";
    readonly flow: TwinsNullableFlowType;
};
export type ResArrayBuffer = {
    readonly type: "arrayBuffer";
    readonly ab: ArrayBuffer;
    readonly flow: TwinsNullableFlowType;
};
export type Res = ResRedirect | ResArrayBuffer;
