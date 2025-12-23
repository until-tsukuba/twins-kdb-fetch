import { KdbSubjectRecord } from "../parser/kdb/types.js";
import { Requisite } from "../util/requisite.js";
import { SubjectNode } from "./types.js";

const createSubjectNode = (subject: KdbSubjectRecord): SubjectNode => {
    const selfNode = new Requisite({ id: subject.courseCode, name: subject.courseName, hasLower: false });
    return {
        node: selfNode,
        type: "subject",
        subject,
        children: null,
    };
};

export const createSubjectNodeList = (subjects: readonly KdbSubjectRecord[]): SubjectNode[] => {
    return subjects.map((subj) => {
        return createSubjectNode(subj);
    });
};
