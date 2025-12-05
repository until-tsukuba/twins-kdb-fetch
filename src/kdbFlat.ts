import { writeFile } from "node:fs/promises";

import { getKdbInitFlow, getSubjectRecordsWithCache } from "./helper/kdb/subjects.js";
import { Requisite } from './util/types.js';

export const getKdbFlatData = async () => {
    const basicFlow = await getKdbInitFlow();
    const kdbSubjectRecords = await getSubjectRecordsWithCache(basicFlow, Requisite.root);
    await writeFile("output/subjects.flat.shallow.kdb.json", JSON.stringify(kdbSubjectRecords, null, 4), "utf8");

    return kdbSubjectRecords;
};
