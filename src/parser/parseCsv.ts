import { commonHeader, RawSubjectRecord } from "../util/subjectRecord.js";
import { ParsedKdbTableType } from "./types.js";

const parseLine = (line: string, i: number, fileName?: string) => {
    const tokens = line.trim().split('"');
    const records: string[][] = [];
    let state = "start"; // 'start' | 'text' | 'mid'
    for (const token of tokens) {
        if (state === "start") {
            if (token === "") {
                // continue;
                state = "text";
                records.push([]);
            } else {
                throw `! line parse error, s:ne, ${JSON.stringify({ line, i })}`;
            }
        } else if (state === "text") {
            records[records.length - 1]?.push(token);
            state = "mid";
        } else {
            if (token === ",") {
                state = "text";
                records.push([]);
            } else if (token.trim() === "") {
                state = "text";
            } else {
                records[records.length - 1]?.push(token);
                state = "mid";
                console.error("! line parse error, m:ne, ", JSON.stringify({ line, i }));
                // 0AS0510, 0ATP9P3, YBG0331, YBG0341, YBG0351
                // throw "";
            }
        }
    }
    if (state !== "text") {
        console.error();
        throw `! state error at ${JSON.stringify({ line, i })}`;
    }
    return records.map((v) => v.join('"'));
};

export const getSubjectsRecord = (csvStr: string, fileName?: string): ParsedKdbTableType => {
    const lines = csvStr.split("\n");
    if (lines.length === 3) {
        console.log(`* no subject in file: ${fileName || 'unknown'}`);
        return [];
    }
    if (lines.length < 3) {
        throw "! unknown";
    }

    const parsed = lines.map((line, i) => parseLine(line, i, fileName));

    const results: { category: string; subjects: RawSubjectRecord[] }[] = [];

    let headers: string[] | null = null;

    for (const line of parsed) {
        if (line.length === 1) {
            results.push({ category: line[0] ?? "", subjects: [] });
            headers = null;
            continue;
        }
        if (line.length === 0) {
            throw `! empty line ${line}`;
        }
        if (headers === null) {
            headers = line;
            if (!(commonHeader.length === headers.length && commonHeader.every((field, index) => line[index] === field.text))) {
                throw `! invalid header, ${line}, ${headers}`;
            }
            continue;
        }
        if (line.length !== commonHeader.length) {
            throw `! column count invalid, ${line}, ${commonHeader}`;
        }
        const lastResult = results[results.length - 1];
        if (!lastResult) {
            throw `! first line invalid, ${JSON.stringify({ results, line, commonHeader }, null, 4)}`;
        }
        lastResult.subjects.push(Object.fromEntries(line.map((field, i) => [commonHeader[i]?.key, field])));
    }

    const lastResult = results[results.length - 1];
    if (!lastResult) {
        console.error("! empty file ? invalid", parsed, commonHeader);
        throw "";
    }
    if (lastResult.category === "" && lastResult.subjects.length === 0) {
        results.pop();
    }
    if (results.length === 0) {
        console.error("! empty file", parsed, commonHeader);
        throw "";
    }
    return results;
};

export const getRootSubjectsRecord = (csvStr: string, fileName?: string): RawSubjectRecord[] => {
    const lines = csvStr.split("\n");
    if (lines.length === 3) {
        console.log(`* no subject in file: ${fileName || "unknown"}`);
        return [];
    }
    if (lines.length < 3) {
        throw "! unknown";
    }

    const parsed = lines.map((line, i) => parseLine(line, i, fileName));

    const results: RawSubjectRecord[] = [];

    let headers: string[] | null = null;

    for (const line of parsed) {
        if (line.length === 0) {
            throw `! empty line ${line}`;
        }
        if (headers === null) {
            headers = line;
            if (!(commonHeader.length === headers.length && commonHeader.every((field, index) => line[index] === field.text))) {
                throw `! invalid header, ${line}, ${headers}`;
            }
            continue;
        }
        if (line.length !== commonHeader.length) {
            throw `! column count invalid, ${line}, ${commonHeader}`;
        }
        results.push(Object.fromEntries(line.map((field, i) => [commonHeader[i]?.key, field])));
    }

    if (results.length === 0) {
        console.error("! empty file", parsed, commonHeader);
        throw "";
    }
    return results;
};
