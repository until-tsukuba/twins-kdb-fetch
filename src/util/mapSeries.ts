import { runWithIndexNLogging } from "../log.js";

export const mapSeries = async <T, R>(items: readonly T[], fn: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = [];
    for (let i = 0; i < items.length; i++) {
        const result = await runWithIndexNLogging(i, items.length, () => fn(items[i] as T));
        results.push(result);
    }
    return results;
};

// export const mapSeries = async <T, R>(items: readonly T[], fn: (item: T) => Promise<R>): Promise<R[]> => {
//     return await Promise.all(items.map((l, i) => {
//         return runWithIndexNLogging(i, items.length, () => fn(l));
//     }));
// };
