import { CookieType } from "../types";

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
export type Res = ResText;
