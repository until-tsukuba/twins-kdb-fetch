import { readFile, writeFile } from "node:fs/promises";
import * as diff from "diff";

const getOldJsonFile = async (filename: string) => {
    try {
        const oldFile = await readFile(`output/${filename}.json`, "utf8");
        return JSON.parse(oldFile);
    } catch {
        return {};
    }
};

const getOldTextFile = async (filename: string): Promise<string> => {
    try {
        const oldFile = await readFile(`output/${filename}`, "utf8");
        return oldFile;
    } catch {
        return "";
    }
};

const diffTwinsSubject = (oldEntry: Record<string, unknown>, newEntry: Record<string, unknown>) => {
    const diffs: Record<string, { from: unknown; to: unknown }> = {};
    for (const key in oldEntry) {
        if (!Object.hasOwn(oldEntry, key)) continue;

        const oldElement = oldEntry[key];
        const newElement = newEntry[key];

        if (JSON.stringify(oldElement) === JSON.stringify(newElement)) {
            continue;
        }

        diffs[key] = { from: oldElement, to: newElement };
    }
    return diffs;
};

export const writeJsonHook = async (obj: string, filename: string) => {
    const oldData: Record<string, unknown> = await getOldJsonFile(filename);
    const newData: Record<string, unknown> = JSON.parse(obj);

    const allCodes = new Set<string>([...Object.keys(oldData), ...Object.keys(newData)]);

    const diffs: { [P in string]: { type: "added" | "removed"; value: unknown } | { type: "modified"; value: Record<string, { from: unknown; to: unknown }> } } = {};

    for (const code of allCodes) {
        const oldEntry = oldData[code];
        const newEntry = newData[code];

        if (JSON.stringify(oldEntry) === JSON.stringify(newEntry)) {
            continue;
        }

        if (!oldEntry) {
            diffs[code] = { type: "added", value: newEntry };
            continue;
        }

        if (!newEntry) {
            diffs[code] = { type: "removed", value: oldEntry };
            continue;
        }

        // modified

        const val = diffTwinsSubject(oldEntry as Record<string, unknown>, newEntry as Record<string, unknown>);
        diffs[code] = { type: "modified", value: val };
    }

    await writeFile(`output/${filename}.diff.json`, JSON.stringify(diffs, null, 2), "utf8");
};

export const writeTextHook = async (text: string, filename: string) => {
    const oldData = await getOldTextFile(filename);
    const newData = text;

    const diffResult = diff.diffLines(oldData, newData);

    const resultText = diffResult
        .map((part) => {
            const prefix = part.added ? "+" : part.removed ? "-" : " ";
            return part.value
                .split("\n").slice(0, -1)
                .map((line) => prefix + line)
                .join("\n");
        })
        .join("\n");

    await writeFile(`output/${filename}.diff`, resultText, "utf8");
};
