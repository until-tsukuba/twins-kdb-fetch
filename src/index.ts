import { writeFile, mkdir } from "node:fs/promises";
import { getKdbTreeData } from "./kdbTree.js";
import { getKdbFlatData } from "./kdbFlat.js";
import { getTwinsData } from "./twins.js";
import { outputReplacer } from "./util/jsonReplacer.js";
import { mergeKdbAndTwinsSubjects } from "./merge/merge.js";

const main = async () => {
    await mkdir("output", { recursive: true });

    console.log("Start fetching data...");

    console.log("Start fetching kdb tree data...");
    const kdbTree = await getKdbTreeData();
    console.log("Finished fetching kdb tree data.");

    console.log("Start fetching kdb flat data...");
    const kdbFlat = await getKdbFlatData();
    console.log("Finished fetching kdb flat data.");

    console.log("Start fetching twins data...");
    const twins = await getTwinsData();
    console.log("Finished fetching twins data.");

    console.log("Finished fetching data.");

    const { irregularSubjects, mergedSubjects } = mergeKdbAndTwinsSubjects(kdbFlat, kdbTree, twins);

    await writeFile("output/subjects.merged.json", JSON.stringify(mergedSubjects, outputReplacer, 4), "utf8");

    await writeFile("output/irregularSubjects.txt", irregularSubjects.map((v) => `${v.key}: ${v.reason}`).join("\n"), "utf8");
};

main();
