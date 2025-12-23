import { writeFile, mkdir } from "node:fs/promises";
import { getKdbTreeData } from "./kdbTree.js";
import { getKdbFlatData } from "./kdbFlat.js";
import { getTwinsData } from "./twins.js";
import { outputReplacer, outputUnsafeObject } from "./util/jsonReplacer.js";
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

    outputUnsafeObject(mergedSubjects);
    await writeFile("output/subjects.merged.json", JSON.stringify(mergedSubjects, outputReplacer, 4), "utf8");

    await writeFile("output/irregularSubjects.txt", irregularSubjects.map((v) => `${v.key}: ${v.reason}`).join("\n"), "utf8");
};

main();
