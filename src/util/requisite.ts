import { ParsedRequisiteType } from "../parser/kdb/types.js";

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
    isRoot(): boolean {
        return this.requisite === null;
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
