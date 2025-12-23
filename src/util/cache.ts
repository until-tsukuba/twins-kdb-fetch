import { mkdir, readFile, writeFile } from "node:fs/promises";
import { cacheReplacer, cacheReviver } from "./jsonReplacer.js";
import { useCache } from "../envs.js";

export type Serializer<T> = {
    serialize: (obj: T) => string;
    deserialize: (str: string) => T;
};

export const JSONSerializer: <T>() => Serializer<T> = () => ({
    serialize: (obj) => {
        return JSON.stringify(obj, cacheReplacer, 4);
    },
    deserialize: (str) => {
        return JSON.parse(str, cacheReviver);
    },
});

export const cache =
    <P extends readonly unknown[], R>(cacheKeyFunc: (...props: P) => string, calc: (...props: P) => Promise<R>, serializer: Serializer<R>): ((...props: P) => Promise<R>) =>
    async (...props: P) => {
        const cacheKey = cacheKeyFunc(...props);

        try {
            if (!useCache) {
                throw new Error("Cache is disabled");
            }
            const cached = serializer.deserialize(await readFile(`cache/${cacheKey}`, "utf8"));
            return cached;
        } catch {
            const result = await calc(...props);
            await mkdir("cache", { recursive: true });
            await writeFile(`cache/${cacheKey}`, serializer.serialize(result), "utf8");
            return result;
        }
    };
