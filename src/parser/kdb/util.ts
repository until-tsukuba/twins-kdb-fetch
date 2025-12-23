import { KdbSubjectRecord } from "./types.js";

export const parseYear = (text: string): KdbSubjectRecord["year"]["value"] => {
    if (text === "?") {
        return {
            type: "unknown",
        };
    }
    return {
        type: "normal",
        value: text
            .split("・")
            .flatMap((t) => {
                if (t.includes("-")) {
                    const [first, last] = t.split("-").map((v) => +v.trim());
                    if (!(typeof first === "number" && typeof last === "number" && first <= last)) {
                        throw new Error(`Invalid year range: ${t}, ${text}`);
                    }
                    return [...Array(last - first + 1)].map((_, i) => i + first);
                } else {
                    const val = +t;
                    if (isNaN(val)) {
                        throw new Error(`Invalid year value: ${t}, ${text}`);
                    }
                    return [val];
                }
            })
            .sort((a, b) => a - b),
    };
};

export const parseCredit = (text: string): KdbSubjectRecord["credits"]["value"] => {
    if (text === "-") {
        return {
            type: "none",
        };
    } else if (text === "?") {
        return {
            type: "unknown",
        };
    }
    return {
        type: "normal",
        value: +text,
    };
};
