import { CookieType } from "./types.js";

export const parseCookie = (cookies: readonly string[]): CookieType | null => {
    const map = new Map(
        cookies.map((c) => {
            const p = c.split(";")[0]?.trim().split("=");
            return [p?.[0] ?? "", p?.[1] ?? ""];
        }),
    );

    return map;
};

export const stringifyCookie = (cookies: CookieType | null): string => {
    if (!cookies) {
        return "";
    }
    return [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
};

export const mergeCookie = (base: CookieType | null, added: CookieType | null): CookieType => {
    const result = new Map<string, string>();

    if (base) {
        for (const [key, value] of base.entries()) {
            result.set(key, value);
        }
    }

    if (added) {
        for (const [key, value] of added.entries()) {
            result.set(key, value);
        }
    }

    return result;
};
