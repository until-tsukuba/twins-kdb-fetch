import { ModuleTimeTable, Terms } from "../parser/twins/buildTwinsSubjectList.js";
import { InstructionalType } from "../util/instructionalType.js";
import { Requisite } from "../util/requisite.js";
import { normalizeSubjectTitle } from "../util/subjectTitleNormalize.js";
import { sortCompArray } from "../util/sortCompArray.js";
import { KdbSubjectRecord } from "../parser/kdb/types.js";
import { TwinsSubject } from "../parser/twins/buildTwinsSubjectList.js";
import { wrapWithStepLogging, runWithSubjectLogging, log } from "../log.js";
import { zipMaps } from "./zipMaps.js";
import { mapSeries } from "../util/mapSeries.js";

type MergedSubject = {
    code: string; // 科目番号
    name: string; // 科目名
    syllabusLatestLink: string | null; // シラバス最新リンク
    instructionalType: {
        value: InstructionalType | null;
        kdbRaw: string | null;
    }; // 授業方法
    credits: {
        value:
            | {
                  type: "normal";
                  value: number;
              }
            | {
                  type: "none";
              }
            | {
                  type: "unknown";
              }
            | null;
        kdbRaw: string | null;
    }; // 単位数
    year: {
        value:
            | {
                  type: "normal";
                  value: readonly number[];
              }
            | {
                  type: "unknown";
              };
        kdbRaw: string | null;
        twinsRaw: string | null;
    }; // 標準履修年次
    terms: {
        term: Terms | null; // 学期
        module: string | null; // 実施学期
        weekdayAndPeriod: string | null; // 曜時限
        moduleTimeTable: ModuleTimeTable | null; // モジュール時間割

        twinsRaw: {
            term: string;
            module: string;
        } | null;
    };
    classroom: null; // 教室
    instructor: {
        value: readonly string[];

        kdbRaw: string | null;
        twinsRaw: string | null;
    }; // 担当教員
    overview: string | null; // 授業概要
    remarks: string | null; // 備考
    auditor: string | null; // 科目等履修生申請可否
    conditionsForAuditors: string | null; // 申請条件

    affiliation: {
        name: string | null;
        code: string | null;

        twinsRaw: {
            name: string;
            code: string;
        } | null;
    };

    requisite: readonly Requisite[];
};

const arrayShallowEqual = <T>(a: readonly T[], b: readonly T[]): boolean => {
    if (a.length !== b.length) return false;
    // use every
    return a.every((value, index) => value === b[index]);
};

export const mergeKdbAndTwinsSubjects = wrapWithStepLogging(
    "merge",
    async (
        kdbFlat: readonly KdbSubjectRecord[],
        kdbTree: {
            subjectsFlatList: readonly (KdbSubjectRecord & {
                readonly requisite: readonly Requisite[];
            })[];
        },
        twins: readonly TwinsSubject[],
    ): Promise<{ irregularSubjects: { key: string; reason: string }[]; mergedSubjects: MergedSubject[] }> => {
        const kdbFlatSubjectsMap = new Map(kdbFlat.map((subject) => [subject.courseCode, subject]));
        const kdbTreeSubjectsMap = new Map(kdbTree.subjectsFlatList.map((subject) => [subject.courseCode, subject]));
        const twinsSubjectsMap = new Map(twins.map((subject) => [subject.code, subject]));

        const subjects = zipMaps(kdbFlatSubjectsMap, kdbTreeSubjectsMap, twinsSubjectsMap);

        const irregularSubjects: { key: string; reason: string }[] = [];

        const mergedSubjects: MergedSubject[] = await mapSeries(subjects, ([key, kdbFlatSubject, kdbTreeSubject, twinsSubject]) => {
            return runWithSubjectLogging(key, () => {
                if (!kdbFlatSubject && !kdbTreeSubject && !twinsSubject) {
                    throw new Error(`No subject found for key: ${key}`);
                }

                if (!kdbFlatSubject) {
                    log.info(`* Subject ${key} not found in kdb flat data`);
                    irregularSubjects.push({
                        key,
                        reason: "Not found in kdb flat data",
                    });
                }
                if (!kdbTreeSubject) {
                    log.info(`* Subject ${key} not found in kdb tree data`);
                    irregularSubjects.push({
                        key,
                        reason: "Not found in kdb tree data",
                    });
                }
                if (!twinsSubject) {
                    // 今年度開講しない科目など
                }

                const choose = <T>(twins: T | undefined, kdb: T | undefined, compFunc?: (a: T, b: T) => boolean): T => {
                    if (twins !== undefined && kdb !== undefined) {
                        const isEqual = compFunc ? compFunc(twins, kdb) : twins === kdb;

                        if (!isEqual) {
                            // Log irregular subjects
                            irregularSubjects.push({
                                key,
                                reason: `KDB: ${JSON.stringify(kdb)}, Twins: ${JSON.stringify(twins)}`,
                            });
                            log.info(`Irregular subject found: ${key}, KdB: ${JSON.stringify(kdb)}, Twins: ${JSON.stringify(twins)}`);
                        }
                        return twins;
                    }

                    if (twins !== undefined) {
                        return twins;
                    } else if (kdb !== undefined) {
                        return kdb;
                    }

                    throw new Error(`No data found`);
                };

                const yearValue = (() => {
                    const twinsYear = twinsSubject?.year;
                    const wrapTwinsYear = (y: readonly number[]) => ({ type: "normal", value: y }) as const;
                    const kdbYear = kdbFlatSubject?.year.value;

                    if (twinsYear && kdbYear) {
                        if (kdbYear.type !== "normal") {
                            irregularSubjects.push({
                                key,
                                reason: `KDB year type is not normal: ${kdbYear.type}`,
                            });
                            log.info(`Irregular subject found: ${key}, KdB year type is not normal: ${kdbYear.type}`);
                            return wrapTwinsYear(twinsYear);
                        }
                        const isEqual = arrayShallowEqual(twinsYear, kdbYear.value);
                        if (!isEqual) {
                            irregularSubjects.push({
                                key,
                                reason: `KDB year value: ${JSON.stringify(kdbYear.value)}, Twins year value: ${JSON.stringify(twinsYear)}`,
                            });
                            log.info(`Irregular subject found: ${key}, KdB year value: ${JSON.stringify(kdbYear.value)}, Twins year value: ${JSON.stringify(twinsYear)}`);
                        }
                        return wrapTwinsYear(twinsYear);
                    } else if (twinsYear) {
                        return wrapTwinsYear(twinsYear);
                    } else if (kdbYear) {
                        return kdbYear;
                    }
                    throw new Error(`No year data found`);
                })();

                return {
                    code: key,
                    // 8310205
                    name: choose(twinsSubject?.name, kdbFlatSubject?.courseName, (a, b) => normalizeSubjectTitle(a) === b),
                    syllabusLatestLink: null,
                    instructionalType: {
                        value: kdbFlatSubject?.courseType ?? null,
                        kdbRaw: kdbFlatSubject?.courseType.code ?? null,
                    },
                    credits: {
                        value: kdbFlatSubject?.credits.value ?? null,
                        kdbRaw: kdbFlatSubject?.credits.text ?? null,
                    },
                    year: {
                        // BB11451
                        value: yearValue,
                        kdbRaw: kdbFlatSubject?.year.text ?? null,
                        twinsRaw: twinsSubject?.raw[6] ?? null,
                    },
                    terms: {
                        term: twinsSubject?.term ?? null,
                        module: kdbFlatSubject?.term ?? null,
                        weekdayAndPeriod: kdbFlatSubject?.weekdayAndPeriod ?? null,
                        moduleTimeTable: twinsSubject?.moduleTimeTable ?? null,

                        twinsRaw: twinsSubject
                            ? {
                                  term: twinsSubject.raw[0],
                                  termCode: twinsSubject.raw[3].onclick,
                                  module: twinsSubject.raw[1],
                              }
                            : null,
                    },
                    classroom: null,
                    instructor: {
                        value: choose(
                            twinsSubject?.instructors,
                            kdbFlatSubject?.instructor?.split(/[,、，]/).map((s) => s.trim()),
                            sortCompArray,
                        ),
                        kdbRaw: kdbFlatSubject?.instructor ?? null,
                        twinsRaw: twinsSubject?.raw[4] ?? null,
                    },
                    overview: kdbFlatSubject?.overview ?? null,
                    remarks: kdbFlatSubject?.remarks ?? null,
                    auditor: kdbFlatSubject?.auditor ?? null,
                    conditionsForAuditors: kdbFlatSubject?.conditionsForAuditors ?? null,
                    exchangeStudent: kdbFlatSubject?.exchangeStudent ?? null,
                    conditionsForExchangeStudents: kdbFlatSubject?.conditionsForExchangeStudents ?? null,
                    JaEnCourseName: kdbFlatSubject?.JaEnCourseName ?? null,
                    parentNumber: kdbFlatSubject?.parentNumber ?? null,
                    parentCourseName: kdbFlatSubject?.parentCourseName ?? null,

                    affiliation: {
                        name: twinsSubject?.affiliation.name ?? null,
                        code: twinsSubject?.affiliation.code ?? null,

                        twinsRaw: twinsSubject
                            ? {
                                  name: twinsSubject.raw[5],
                                  code: twinsSubject.raw[3].onclick,
                              }
                            : null,
                    },

                    kdbDataUpdateDate: kdbFlatSubject?.dataUpdateDate ?? null,

                    requisite: kdbTreeSubject?.requisite || [], // kdbTreeSubject
                };
            });
        });

        return {
            irregularSubjects,
            mergedSubjects,
        };
    },
);
