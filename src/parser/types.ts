import { RawSubjectRecord } from "../util/subjectRecord";

export type ParsedHierarchyType = [{ value: string; text: string }[], { value: string; text: string }[], { value: string; text: string }[], { value: string; text: string }[], { value: string; text: string }[]];

export type ParsedTwinsTableType = {
    head: (string | { text: string; onclick: string })[];
    body: (string | { text: string; onclick: string })[][];
};

export type ParsedKdbTableType = {
    category: string;
    subjects: RawSubjectRecord[];
}[];
