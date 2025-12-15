import { writeFile, mkdir } from "node:fs/promises";
import { getKdbTreeData } from "./kdbTree.js";
import { getKdbFlatData } from "./kdbFlat.js";
import { getTwinsData } from "./twins.js";
import { outputReplacer } from "./util/jsonReplacer.js";
import { mergeKdbAndTwinsSubjects } from "./merge/merge.js";

const main = async () => {
    await mkdir("output", { recursive: true });

    const kdbTree = await getKdbTreeData();

    const kdbFlat = await getKdbFlatData();

    const twins = await getTwinsData();

    const { irregularSubjects, mergedSubjects } = await mergeKdbAndTwinsSubjects(kdbFlat, kdbTree, twins);

    await writeFile("output/subjects.merged.json", JSON.stringify(mergedSubjects, outputReplacer, 4), "utf8");

    await writeFile("output/irregularSubjects.txt", irregularSubjects.map((v) => `${v.key}: ${v.reason}`).join("\n"), "utf8");
};

main();
