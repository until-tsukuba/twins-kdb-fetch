import { ReadableSubjectRecord } from "../util/readableSubject";
import { Hierarchy } from "../util/types";

export type SubjectNode = {
    type: "subject";
    node: Hierarchy;
    subject: ReadableSubjectRecord;
    children: null;
};

export type SubCategoryNode = {
    type: "sub_category";
    node: Hierarchy;
    children: SubjectNode[];
};

export type LeafResultNode = SubCategoryNode | SubjectNode;
