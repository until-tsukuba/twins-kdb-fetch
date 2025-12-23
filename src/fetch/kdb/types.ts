import { CookieType } from "../types.js";

export type KdBFlowType = {
    readonly cookie: CookieType;
};

export type KdBNullableFlowType = {
    readonly cookie: CookieType | null;
};

export type ResText = {
    readonly type: "text";
    readonly text: string;
    readonly flow: KdBNullableFlowType;
};

export type ResArrayBuffer = {
    readonly type: "arrayBuffer";
    readonly ab: ArrayBuffer;
    readonly flow: KdBNullableFlowType;
};
export type Res = {
    readonly res: Response;
    readonly cookie: CookieType | null;
};
