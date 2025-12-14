import { CookieType } from "../types.js";

export type KdBFlowType = {
    cookie: CookieType;
};

export type KdBNullableFlowType = {
    cookie: CookieType | null;
};

export type ResText = {
    type: "text";
    text: string;
    flow: KdBNullableFlowType;
};

export type ResArrayBuffer = {
    type: "arrayBuffer";
    ab: ArrayBuffer;
    flow: KdBNullableFlowType;
};
export type Res = {
    res: Response;
    cookie: CookieType | null;
};
