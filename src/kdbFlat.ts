import { writeFile } from "node:fs/promises";

import endpoints from "./fetch/endpoints.js";

import { getRootSubjectsRecord } from "./parser/parseCsv.js";

import { Hierarchy } from "./util/types.js";
import { readableSubject } from "./util/readableSubject.js";

export const getKdbFlatData = async () => {
    const rootHierarchy = new Hierarchy([]);

    const initialFlow = await endpoints.kdb.init();
    const searchFlow = await endpoints.kdb.searchSubject(initialFlow, rootHierarchy);
    const downloadFlow = await endpoints.kdb.outputCsv(searchFlow, rootHierarchy);
    const csv = await endpoints.getContent(downloadFlow, "shift-jis");

    const parsedRawSubjects = getRootSubjectsRecord(csv, `${rootHierarchy.serialize()}.subjects.shallow.json`);

    const subjects = parsedRawSubjects.map((subj) => readableSubject(subj));

    await writeFile("output/subjects.flat.shallow.kdb.json", JSON.stringify(subjects, null, 4), "utf8");

    return subjects;
};
