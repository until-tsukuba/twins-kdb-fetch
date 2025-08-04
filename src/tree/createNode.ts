import { SubCategory } from "../parser/buildKdbSubCategories";
import { ReadableSubjectRecord } from "../util/readableSubject";
import { Hierarchy } from "../util/types";
import { LeafResultNode, SubCategoryNode, SubjectNode } from "./types";

const createSubjectNode = (parentNode: Hierarchy, subject: ReadableSubjectRecord): SubjectNode => {
    const selfNode = parentNode.pushed(subject.courseNumber, subject.courseName);
    return {
        node: selfNode,
        type: "subject",
        subject,
        children: null,
    };
};

const createSubjectNodeList = (parentNode: Hierarchy, subjects: ReadableSubjectRecord[]): SubjectNode[] => {
    return subjects.map((subj) => {
        return createSubjectNode(parentNode, subj);
    });
};

const createSubCategoryNode = (parentNode: Hierarchy, subjects: ReadableSubjectRecord[], category: string): SubCategoryNode => {
    const selfNode = parentNode.pushed(null, category);
    return {
        node: selfNode,
        type: "sub_category",
        children: createSubjectNodeList(selfNode, subjects),
    };
};

const createSubCategoryNodeList = (parentNode: Hierarchy, categories: SubCategory[]): SubCategoryNode[] => {
    return categories.map(({ category, subjects }) => {
        return createSubCategoryNode(parentNode, subjects, category);
    });
};

export const createLeafResultNode = (hierarchy: Hierarchy, categories: SubCategory[]): LeafResultNode[] => {
    if (categories.length === 0) {
        return [];
    }

    if (categories.length === 1 && categories[0] !== undefined && hierarchy.getLength() > 0 && categories[0].category === hierarchy.getLast()?.text) {
        return createSubjectNodeList(hierarchy, categories[0].subjects);
    }
    return createSubCategoryNodeList(hierarchy, categories);
};
