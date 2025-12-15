import { parse as csvParse } from "csv-parse/sync";
import { commonHeader, RawKdbSubjectRecord } from "./kdbSubjectRecord.js";

const assertHeader = (headerLine: readonly string[]) => {
    if (!(commonHeader.length === headerLine.length && commonHeader.every((field, index) => headerLine[index] === field.text))) {
        throw `! invalid header, ${JSON.stringify(headerLine)}, ${JSON.stringify(commonHeader)}, ${JSON.stringify(commonHeader.map((h) => h.text))}`;
    }
};

const parseRecord = (record: readonly string[]): RawKdbSubjectRecord => {
    if (record.length !== commonHeader.length) {
        throw `! record length invalid, ${record}, ${commonHeader}`;
    }
    return Object.fromEntries(record.map((field, i) => [commonHeader[i]?.key, field.trim()]));
};

export const getSubjectsRecord = (csvStr: string, isRoot: boolean, fileName?: string): { category: string | null; subjects: RawKdbSubjectRecord[] } => {
    const { category, clippedCsvStr } = (() => {
        if (isRoot) {
            return { category: null, clippedCsvStr: csvStr };
        }

        const firstNewlineIndex = csvStr.indexOf("\n");
        if (firstNewlineIndex === -1) {
            throw "! category line not found";
        }

        const rawCategory = csvStr.slice(0, firstNewlineIndex).replace(/\r$/, "");
        const rest = csvStr.slice(firstNewlineIndex + 1);
        return { category: rawCategory, clippedCsvStr: rest };
    })();

    const parsed = csvParse(clippedCsvStr);

    const clippedParsed = ((parsed) => {
        if (isRoot) {
            // no csv header line
            return parsed;
        }

        if (parsed[0] === undefined) {
            throw "! empty csv data";
        }

        assertHeader(parsed[0]);

        return parsed.slice(1);
    })(parsed);

    const subjects: RawKdbSubjectRecord[] = clippedParsed.map((line, i) => parseRecord(line));
    return { category, subjects };
};
