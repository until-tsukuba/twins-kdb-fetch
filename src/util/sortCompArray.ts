export const sortCompArray = <T>(a: readonly T[], b: readonly T[], comp?: undefined | ((a: T, b: T) => number)): boolean => {
    const sortedA = a.toSorted(comp);
    const sortedB = b.toSorted(comp);

    if (sortedA.length !== sortedB.length) {
        return false;
    }

    for (let i = 0; i < sortedA.length; i++) {
        const isEqual = comp ?? ((x: T, y: T) => (x === y ? 0 : 1));
        const valA = sortedA[i];
        const valB = sortedB[i];
        if (valA === undefined || valB === undefined) {
            return false;
        }
        if (isEqual(valA, valB) !== 0) {
            return false;
        }
    }

    return true;
};
