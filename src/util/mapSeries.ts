export const mapSeries = async <T, R>(items: readonly T[], fn: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = [];
    for (const item of items) {
        results.push(await fn(item));
    }
    return results;
};
