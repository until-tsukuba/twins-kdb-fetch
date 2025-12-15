import { ParsedRequisiteType } from "./kdb/types.js";
import { ParsedTwinsTableType } from "./twins/types.js";

declare module "unified" {
    interface CompileResultMap {
        tableParsed: ParsedTwinsTableType;
        kdbRequisites: ParsedRequisiteType;
    }
}
export {};
