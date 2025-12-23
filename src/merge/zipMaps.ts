export function zipMaps<K = string, T extends unknown[] = unknown[]>(...maps: { [I in keyof T]: Map<K, T[I]> }): [K, ...{ [I in keyof T]: T[I] | undefined }][] {
    const mergedKey = [...new Set(maps.flatMap((map) => [...map.keys()]))];

    return mergedKey.map((key) => {
        // Array.prototype.mapはタプル型を維持しないので、asで妥協
        const vals = maps.map((map) => map.get(key)) as { [I in keyof T]: T[I] | undefined };
        return [key, ...vals];
    });
}
