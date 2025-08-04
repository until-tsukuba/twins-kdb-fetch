import { mkdir, readFile, writeFile } from "node:fs/promises";

export type Serializer<T> = {
    serialize: (obj: T) => string;
    deserialize: (str: string) => T;
};

export const JSONSerializer: <T>() => Serializer<T> = () => ({
    serialize: (obj) => {
        return JSON.stringify(obj, null, 4);
    },
    deserialize: (str) => {
        return JSON.parse(str);
    },
});

export const emptySerializer: Serializer<string> = {
    serialize: (obj) => {
        return obj;
    },
    deserialize: (str) => {
        return str;
    },
};

const useCache = false; // Set to false to disable cache for debugging

export const cache =
    <P extends unknown[], R>(cacheKeyFunc: (...props: P) => string, calc: (...props: P) => Promise<R>, serializer: Serializer<R>): ((...props: P) => Promise<R>) =>
    async (...props: P) => {
        const cacheKey = cacheKeyFunc(...props);

        try {
            if (!useCache) {
                throw new Error("Cache is disabled");
            }
            const cached = serializer.deserialize(await readFile(`cache/${cacheKey}`, "utf8"));
            return cached;
        } catch (error) {
            const result = await calc(...props);
            await mkdir("cache", { recursive: true });
            await writeFile(`cache/${cacheKey}`, serializer.serialize(result), "utf8");
            return result;
        }
    };
