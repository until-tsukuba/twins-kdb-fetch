import { runWithSubjectLogging } from "../../log.js";
import { getInstructionalType } from "../../util/instructionalType.js";
import { mapSeries } from "../../util/mapSeries.js";
import { RawKdbSubjectRecord } from "./kdbSubjectRecord.js";
import { KdbSubjectRecord } from "./types.js";
import { parseCredit, parseYear } from "./util.js";

export const buildKdbSubjects = (subjects: readonly RawKdbSubjectRecord[]): Promise<KdbSubjectRecord[]> => {
    return mapSeries(subjects, (subject) =>
        runWithSubjectLogging(subject.courseNumber, () => {
            return {
                courseCode: subject.courseNumber,
                courseName: subject.courseName,
                courseType: {
                    code: subject.courseType,
                    ...getInstructionalType(subject.courseType),
                },
                credits: {
                    text: subject.credits,
                    value: parseCredit(subject.credits),
                },
                year: {
                    text: subject.year,
                    value: parseYear(subject.year),
                },
                term: subject.term,
                weekdayAndPeriod: subject.weekdayAndPeriod,
                classroom: null,
                instructor: subject.instructor,
                overview: subject.overview,
                remarks: subject.remarks,
                auditor: subject.auditor,
                conditionsForAuditors: subject.conditionsForAuditors,
                exchangeStudent: subject.exchangeStudent,
                conditionsForExchangeStudents: subject.conditionsForExchangeStudents,
                JaEnCourseName: subject.JaEnCourseName,
                parentNumber: subject.parentNumber,
                parentCourseName: subject.parentCourseName,
                dataUpdateDate: subject.dataUpdateDate,
            };
        }),
    );
};
