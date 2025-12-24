import { writeFile } from "node:fs/promises";
import { outputReplacer, outputUnsafeObject } from "./jsonReplacer.js";

type OutputJsonFiles = "subjects.merged.json" | "tree.kdb.json" | "subjects.flat.kdb.json" | "subjects.flat.shallow.kdb.json" | "subjects.twins.json";

export const writeOutputJsonFile = async (obj: unknown, filename: OutputJsonFiles) => {
    outputUnsafeObject(obj);
    await writeFile(`output/${filename}`, JSON.stringify(obj, outputReplacer, 4), "utf8");
};

type OutputTextFiles = "irregularSubjects.txt" | "hierarchy.kdb.txt";

export const writeOutputTextFile = async (text: string, filename: OutputTextFiles) => {
    await writeFile(`output/${filename}`, text, "utf8");
};
