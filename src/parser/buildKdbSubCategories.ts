import { readableSubject, ReadableSubjectRecord } from "../util/readableSubject.js";
import { ParsedKdbTableType } from "./types";

export type SubCategory = {
    category: string;
    subjects: ReadableSubjectRecord[];
};

export const buildKdbSubCategories = (categories: ParsedKdbTableType): SubCategory[] => {
    return categories.map(({ category, subjects }) => {
        return {
            category,
            subjects: subjects.map((subj) => readableSubject(subj)),
        };
    });
};
