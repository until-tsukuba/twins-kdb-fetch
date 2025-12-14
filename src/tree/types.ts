import { KdbSubjectRecord } from "../parser/kdb/types.js";
import { Requisite } from "../util/requisite.js";

export type SubjectNode = {
    type: "subject";
    node: Requisite;
    subject: KdbSubjectRecord;
    children: null;
};

// export type LeafResultNode = SubjectNode;
