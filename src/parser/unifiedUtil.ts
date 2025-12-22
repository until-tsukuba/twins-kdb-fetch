import { ParsedRequisiteType, ParsedSearchResultType } from "./kdb/types.js";
import { ParsedTwinsTableType } from "./twins/types.js";
import { ParsedHierarchyType } from "./types.js";

declare module "unified" {
    interface CompileResultMap {
        hierarchies: ParsedHierarchyType;
        tableParsed: ParsedTwinsTableType;
        kdbRequisites: ParsedRequisiteType;
        kdbSearchResults: ParsedSearchResultType;
    }
}
export {};
