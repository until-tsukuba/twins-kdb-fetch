export type HierarchyType = { value: string | null; text: string }[];

export class Hierarchy {
    private hierarchy: HierarchyType;

    constructor(hierarchy: HierarchyType) {
        this.hierarchy = hierarchy;
    }
    getHierarchyIds(): (string | null)[] {
        return this.hierarchy.map((h) => h.value);
    }
    serialize(): string {
        return this.getHierarchyIds().join("_");
    }
    getLength(): number {
        return this.hierarchy.length;
    }
    pushed(value: string | null, text: string): Hierarchy {
        return new Hierarchy([...this.hierarchy, { value, text }]);
    }
    getLast(): { value: string | null; text: string } | null {
        return this.hierarchy[this.hierarchy.length - 1] ?? null;
    }

    genChildren(choices: { value: string | null; text: string }[]): Hierarchy[] {
        return choices.map((choice) => this.pushed(choice.value, choice.text));
    }
    static root = new Hierarchy([]);
    toCacheJSON() {
        return { type: "hierarchy", hierarchy: this.hierarchy };
    }
    static fromCacheJSON(value: { type: "hierarchy"; hierarchy: HierarchyType }) {
        return new Hierarchy(value.hierarchy);
    }
    toOutputJSON() {
        return this.hierarchy;
    }
}
