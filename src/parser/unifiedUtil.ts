import { ParsedRequisiteType, ParsedSearchResultType } from "./kdb/types";
import { ParsedTwinsTableType } from "./twins/types";
import { ParsedHierarchyType } from "./types";

declare module "unified" {
    interface CompileResultMap {
        hierarchies: ParsedHierarchyType;
        tableParsed: ParsedTwinsTableType;
        kdbRequisites: ParsedRequisiteType;
        kdbSearchResults: ParsedSearchResultType;
    }
}
export {};
