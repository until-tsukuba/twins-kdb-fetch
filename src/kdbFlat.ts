import { getKdbInitFlow, getSubjectRecordsWithCache } from "./helper/kdb/subjects.js";
import { Requisite } from "./util/requisite.js";
import { wrapWithStepLogging } from "./log.js";
import { writeOutputJsonFile } from "./util/output.js";

export const getKdbFlatData = wrapWithStepLogging("kdb-flat", async () => {
    const basicFlow = await getKdbInitFlow();
    const kdbSubjectRecords = await getSubjectRecordsWithCache(basicFlow, Requisite.root);
    await writeOutputJsonFile(kdbSubjectRecords, "subjects.flat.shallow.kdb.json");

    return kdbSubjectRecords;
});
