import { ParsedTwinsCeilType } from "./types.js";

export function assertCeilIsString(ceil: ParsedTwinsCeilType | undefined): asserts ceil is string {
    if (typeof ceil !== "string") {
        throw new Error(`Ceil is not a string: ${JSON.stringify(ceil)}`);
    }
}
