import { Requisite, RequisiteType } from "./requisite.js";

export const outputReplacer = (_key: string, value: unknown) => {
    if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
        throw new Error(`Invalid number value: [${_key}] ${value}`);
    }
    if (value instanceof Requisite) {
        return value.toOutputJSON();
    }
    return value;
};

export const cacheReplacer = (_key: string, value: unknown) => {
    if (value instanceof Requisite) {
        return value.toCacheJSON();
    }
    return value;
};

export const cacheReviver = (_key: string, value: unknown) => {
    if (typeof value === "object" && value !== null && "type" in value && value.type === "requisite") {
        return Requisite.fromCacheJSON(value as { type: "requisite"; requisite: RequisiteType });
    }
    return value;
};
