import { mkdir } from "node:fs/promises";
import { getKdbTreeData } from "./kdbTree.js";
import { getKdbFlatData } from "./kdbFlat.js";
import { getTwinsData } from "./twins.js";
import { writeOutputJsonFile, writeOutputTextFile } from "./output/output.js";
import { mergeKdbAndTwinsSubjects } from "./merge/merge.js";
import { runWithIrregularCollector } from "./log.js";

const main = async () => {
    await mkdir("output", { recursive: true });

    const irregularSubjects: { key: string; reason: string }[] = [];

    const mergedSubjects = await runWithIrregularCollector(
        (subject, reason) => {
            irregularSubjects.push({
                key: subject,
                reason,
            });
        },
        async () => {
            const kdbTree = await getKdbTreeData();

            const kdbFlat = await getKdbFlatData();

            const twins = await getTwinsData();
            const mergedSubjects = await mergeKdbAndTwinsSubjects(kdbFlat, kdbTree, twins);
            return mergedSubjects.mergedSubjects;
        },
    );
    const mergedSubjectsMap = Object.fromEntries(mergedSubjects.map((s) => [s.code, s]));

    await writeOutputJsonFile(mergedSubjects, "subjects.merged");
    await writeOutputJsonFile(mergedSubjectsMap, "subjects.merged.map");
    await writeOutputTextFile(irregularSubjects.map((v) => `${v.key}: ${v.reason}`).join("\n"), "irregularSubjects.txt");
};

main();
