import { getInstructionalType } from "../../util/instructionalType";
import { KdbSubjectRecord, ParsedSearchResultType } from "./types";
import { parseCredit, parseYear } from "./util";

export const buildKdbSubjects = (subject: ParsedSearchResultType): KdbSubjectRecord[] => {
    return subject.map((subject) => {
        return {
            courseCode: subject.code,
            courseName: subject.title,
            syllabusLatestLink: subject.syllabusLatestLink,
            courseType: {
                code: subject.style,
                ...getInstructionalType(subject.style),
            },
            credits: {
                text: subject.credit,
                value: parseCredit(subject.credit),
            },
            year: {
                text: subject.grade,
                value: parseYear(subject.grade),
            },
            term: subject.term,
            weekdayAndPeriod: subject.day,
            classroom: null,
            instructor: subject.agent,
            overview: subject.body,
            remarks: subject.remark,
            auditor: subject.auditor,
            conditionsForAuditors: subject.auditorReason,
        };
    });
};
