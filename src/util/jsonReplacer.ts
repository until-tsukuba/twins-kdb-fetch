import { Hierarchy } from "./types";

export const outputReplacer = (_key: string, value: unknown) => {
    if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
        throw new Error(`Invalid number value: [${_key}] ${value}`);
    }
    if (value instanceof Hierarchy) {
        return value.toOutputJSON();
    }
    return value;
};

export const cacheReplacer = (_key: string, value: unknown) => {
    if (value instanceof Hierarchy) {
        return value.toCacheJSON();
    }
    return value;
};

export const cacheReviver = (_key: string, value: unknown) => {
    if (typeof value === "object" && value !== null && "type" in value && value.type === "hierarchy") {
        return Hierarchy.fromCacheJSON(value as { type: "hierarchy"; hierarchy: { value: string | null; text: string }[] });
    }
    return value;
};
