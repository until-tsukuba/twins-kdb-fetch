import { log } from "../log.js";
import { Requisite, RequisiteType } from "../util/requisite.js";
import { visit } from "../util/visit.js";

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

export const outputUnsafeObject = (obj: unknown) => {
    visit<{ key: string; value: unknown }, string[]>(
        { key: "", value: obj },
        [],
        ({ key, value }, path) => {
            if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
                log.info(`Invalid number at path: ${path.join(".")}, value: ${value}`);
            }
            return [...path, key];
        },
        ({ value }) => {
            if (typeof value !== "object" || value === null) {
                return [];
            }
            return Object.entries(value).map(([k, v]) => ({ key: k, value: v }));
        },
    );
};
