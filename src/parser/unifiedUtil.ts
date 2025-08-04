import { ParsedHierarchyType, ParsedTwinsTableType } from './types';

declare module "unified" {
    interface CompileResultMap {
        hierarchies: ParsedHierarchyType;
        tableParsed: ParsedTwinsTableType;
    }
}
export {};
