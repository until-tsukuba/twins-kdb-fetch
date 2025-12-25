import { writeFile } from "node:fs/promises";
import { outputReplacer, outputUnsafeObject } from "./jsonReplacer.js";
import { writeJsonHook, writeTextHook } from "./diff.js";
import { Requisite } from "./requisite.js";
import { SubjectNode } from "../tree/types.js";
import { DfsTreeNode } from "../tree/dfs.js";
import { KdbSubjectRecord } from "../parser/kdb/types.js";
import { TwinsSubject } from "../parser/twins/buildTwinsSubjectList.js";
import { MergedSubject } from "../merge/merge.js";

export type OutputJsonType = {
    "tree.kdb": DfsTreeNode<Requisite, SubjectNode[]>;
    "subjects.flat.kdb": (KdbSubjectRecord & { readonly requisite: readonly Requisite[] })[];
    "subjects.flat.shallow.kdb": KdbSubjectRecord[];
    "subjects.twins": TwinsSubject[];
    "subjects.merged": MergedSubject[];
    "subjects.flat.kdb.map": {
        [k: string]: KdbSubjectRecord & {
            readonly requisite: readonly Requisite[];
        };
    };
    "subjects.flat.shallow.kdb.map": {
        [k: string]: KdbSubjectRecord;
    };
    "subjects.twins.map": {
        [k: string]: TwinsSubject;
    };
    "subjects.merged.map": {
        [k: string]: MergedSubject;
    };
};

export const writeOutputJsonFile = async <T extends keyof OutputJsonType>(obj: OutputJsonType[T], filename: T) => {
    outputUnsafeObject(obj);
    const text = JSON.stringify(obj, outputReplacer, 4);
    if (!Array.isArray(obj) && !("children" in obj)) {
        await writeJsonHook(text, filename);
    }
    await writeFile(`output/${filename}.json`, text, "utf8");
};

type OutputTextFiles = "irregularSubjects.txt" | "hierarchy.kdb.txt";

export const writeOutputTextFile = async (text: string, filename: OutputTextFiles) => {
    await writeTextHook(text, filename);
    await writeFile(`output/${filename}`, text, "utf8");
};
