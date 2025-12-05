import { ParsedRequisiteType } from "../parser/kdb/types";

// export type HierarchyType = {
//     value: string;
//     text: string;
//     hasLower: boolean;
// }[];

// export class Hierarchy {
//     private hierarchy: HierarchyType;

//     constructor(hierarchy: HierarchyType) {
//         this.hierarchy = hierarchy;
//     }
//     getHierarchyIds(): string[] {
//         return this.hierarchy.map((h) => h.value);
//     }
//     serialize(): string {
//         return this.getHierarchyIds().join("_");
//     }
//     getLength(): number {
//         return this.hierarchy.length;
//     }
//     pushed(value: string, text: string, hasLower: boolean): Hierarchy {
//         return new Hierarchy([...this.hierarchy, { value, text, hasLower }]);
//     }
//     getLast(): { value: string; text: string; hasLower: boolean } | null {
//         return this.hierarchy[this.hierarchy.length - 1] ?? null;
//     }

//     genChildren(choices: ParsedRequisiteType): Hierarchy[] {
//         return choices.map((choice) => this.pushed(choice.id, choice.name, choice.hasLower));
//     }
//     static root = new Hierarchy([]);
//     toCacheJSON() {
//         return { type: "hierarchy", hierarchy: this.hierarchy };
//     }
//     static fromCacheJSON(value: { type: "hierarchy"; hierarchy: HierarchyType }) {
//         return new Hierarchy(value.hierarchy);
//     }
//     toOutputJSON() {
//         return this.hierarchy;
//     }
// }

export type RequisiteType = {
    id: string;
    name: string;
    hasLower: boolean;
} | null;

export class Requisite {
    private requisite: RequisiteType;

    constructor(requisite: RequisiteType) {
        this.requisite = requisite;
    }

    getId(): string | null {
        return this.requisite?.id ?? null;
    }

    getName(): string | null {
        return this.requisite?.name ?? null;
    }

    getHasLower(): boolean | null {
        return this.requisite?.hasLower ?? null;
    }
    serialize(): string {
        return this.getId() ?? "root";
    }

    equals(other: unknown): boolean {
        if (!(other instanceof Requisite)) {
            return false;
        }
        return this.getId() === other.getId();
    }

    static root = new Requisite(null);
    static genMultiple(requisites: ParsedRequisiteType): Requisite[] {
        return requisites.map((req) => new Requisite(req));
    }

    toCacheJSON() {
        return { type: "requisite", requisite: this.requisite };
    }

    static fromCacheJSON(value: { type: "requisite"; requisite: RequisiteType }) {
        return new Requisite(value.requisite);
    }

    toOutputJSON() {
        return this.requisite;
    }
    toString(): string {
        return `Requisite(${this.serialize()})`;
    }
}
