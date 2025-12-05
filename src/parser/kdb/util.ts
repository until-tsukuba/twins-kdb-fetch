export const parseYear = (text: string) => {
    return text
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
                    return [];
                }
                return [val];
            }
        })
        .sort((a, b) => a - b);
};

export const parseCredit = (text: string) => {
    return text.trim() === "-" ? null : +text.trim();
};
