import { getKdbInitFlow, getSubjectRecordsWithCache } from "./helper/kdb/subjects.js";
import { Requisite } from "./util/requisite.js";
import { wrapWithStepLogging } from "./log.js";
import { writeOutputJsonFile } from "./util/output.js";

export const getKdbFlatData = wrapWithStepLogging("kdb-flat", async () => {
    const basicFlow = await getKdbInitFlow();
    const kdbSubjectRecords = await getSubjectRecordsWithCache(basicFlow, Requisite.root);
    const kdbSubjectMap = Object.fromEntries(kdbSubjectRecords.map((s) => [s.courseCode, s]));

    await writeOutputJsonFile(kdbSubjectRecords, "subjects.flat.shallow.kdb");
    await writeOutputJsonFile(kdbSubjectMap, "subjects.flat.shallow.kdb.map");

    return kdbSubjectRecords;
});
