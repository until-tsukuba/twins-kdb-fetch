import { KdbSubjectRecord } from "../parser/kdb/types";
import { Requisite } from "../util/types";

export type SubjectNode = {
    type: "subject";
    node: Requisite;
    subject: KdbSubjectRecord;
    children: null;
};

// export type SubCategoryNode = {
//     type: "sub_category";
//     node: Requisite;
//     children: SubjectNode[];
// };

export type LeafResultNode = /*SubCategoryNode |*/ SubjectNode; // use kdb released
