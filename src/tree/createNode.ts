import { KdbSubjectRecord } from "../parser/kdb/types";
import { Requisite } from "../util/types";
import { LeafResultNode, SubjectNode } from "./types";

const createSubjectNode = (subject: KdbSubjectRecord): SubjectNode => {
    const selfNode = new Requisite({ id: subject.courseCode, name: subject.courseName, hasLower: false });
    return {
        node: selfNode,
        type: "subject",
        subject,
        children: null,
    };
};

const createSubjectNodeList = (subjects: KdbSubjectRecord[]): SubjectNode[] => {
    return subjects.map((subj) => {
        return createSubjectNode(subj);
    });
};

export const createLeafResultNode = (categories: KdbSubjectRecord[]): LeafResultNode[] => {
    return createSubjectNodeList(categories);
};
