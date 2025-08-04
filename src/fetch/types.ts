export type CookieType = Record<"JSESSIONID" | "kdb-twins", string>;
export type FlowType = {
    cookie: CookieType;
    flowExecutionKey: string;
};

export type NullableFlowType = {
    cookie: CookieType | null;
    flowExecutionKey: string | null;
};
export type CookieOnlyFlowType = {
    cookie: CookieType;
    flowExecutionKey: string | null;
};

export type ResRedirect = {
    type: "redirect";
    flow: NullableFlowType;
};
export type ResArrayBuffer = {
    type: "arrayBuffer";
    ab: ArrayBuffer;
    flow: NullableFlowType;
};
export type Res = ResRedirect | ResArrayBuffer;
