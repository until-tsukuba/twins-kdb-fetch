import { writeFile, mkdir } from "fs/promises";
import { getKdbTreeData } from "./kdbTree.js";
import { ModuleTimeTable, Terms } from "./parser/buildTwinsSubjectList";
import { getTwinsData } from "./twins.js";
import { InstructionalType } from "./util/instructionalType";
import { Hierarchy } from "./util/types.js";

type MergedSubject = {
    code: string;
    name: string;
    instructionalType: {
        value: InstructionalType | undefined;
        kdbRaw: string | undefined;
    };
    credits: {
        value:
            | {
                  type: "number";
                  value: number;
              }
            | {
                  type: "none";
              }
            | undefined;
        kdbRaw: string | undefined;
    };
    year: {
        value: number[];
        kdbRaw: string | undefined;
        twinsRaw: string | undefined;
    };
    terms: {
        term: Terms | undefined;
        module: string | undefined;
        weekdayAndPeriod: string | undefined;
        moduleTimeTable: ModuleTimeTable | undefined;

        twinsRaw:
            | {
                  term: string;
                  module: string;
              }
            | undefined;
    };
    classroom: null;
    instructor: {
        value: string[] | undefined;

        kdbRaw: string | undefined;
        twinsRaw: string | undefined;
    };
    overview: string | undefined;
    remarks: string | undefined;
    auditor: string | undefined;
    conditionsForAuditors: string | undefined;
    exchangeStudent: string | undefined;
    conditionsForExchangeStudents: string | undefined;
    JaEnCourseName: string | undefined;
    parentNumber: string | undefined;
    parentCourseName: string | undefined;

    affiliation: {
        name: string | undefined;
        code: string | undefined;

        twinsRaw:
            | {
                  name: string;
                  code: string;
              }
            | undefined;
    };

    kdbDataUpdateDate: string | undefined;

    hierarchy: Hierarchy[];
};

const arrayShallowEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) return false;
    // use every
    return a.every((value, index) => value === b[index]);
};

const main = async () => {
    await mkdir("output", { recursive: true });

    const kdb = await getKdbTreeData();
    const twins = await getTwinsData();

    const kdbSubjectsMap = new Map(kdb.subjectsFlatList.map((subject) => [subject.courseNumber, subject]));
    const twinsSubjectsMap = new Map(twins.map((subject) => [subject.code, subject]));

    const mergedKey = [...new Set([...kdbSubjectsMap.keys(), ...twinsSubjectsMap.keys()])];

    const irregularSubjects: { key: string; reason: string }[] = [];

    const mergedSubjects: MergedSubject[] = mergedKey.map((key) => {
        console.log(`Processing subject: ${key}`);

        const kdbSubject = kdbSubjectsMap.get(key);
        const twinsSubject = twinsSubjectsMap.get(key);

        if (!kdbSubject && !twinsSubject) {
            throw new Error(`No subject found for key: ${key}`);
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
                    console.warn(`Irregular subject found: ${key}, KDB: ${JSON.stringify(kdb)}, Twins: ${JSON.stringify(twins)}`);
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

        return {
            code: key,
            // 8310205
            name: choose(twinsSubject?.name, kdbSubject?.courseName),
            instructionalType: {
                value: kdbSubject?.courseType,
                kdbRaw: kdbSubject?.courseType.code,
            },
            credits: {
                value: kdbSubject && (typeof kdbSubject?.credits.value === "number" ? { type: "number", value: kdbSubject.credits.value } : { type: "none" }),
                // TODO: clean
                kdbRaw: kdbSubject?.credits.text,
            },
            year: {
                // BB11451
                value: choose(twinsSubject?.year, kdbSubject?.year.value, arrayShallowEqual),
                kdbRaw: kdbSubject?.year.text,
                twinsRaw: twinsSubject?.raw[6],
            },
            terms: {
                term: twinsSubject?.term,
                module: kdbSubject?.term,
                weekdayAndPeriod: kdbSubject?.weekdayAndPeriod,
                moduleTimeTable: twinsSubject?.moduleTimeTable,

                twinsRaw: twinsSubject && {
                    term: twinsSubject.raw[0],
                    termCode: twinsSubject.raw[3].onclick,
                    module: twinsSubject.raw[1],
                },
            },
            classroom: null,
            instructor: {
                value: twinsSubject?.instructors ? kdbSubject?.instructor.split(",").map((s) => s.trim()) : undefined, // TODO: clean
                kdbRaw: kdbSubject?.instructor,
                twinsRaw: twinsSubject?.raw[4],
            },
            overview: kdbSubject?.overview,
            remarks: kdbSubject?.remarks,
            auditor: kdbSubject?.auditor,
            conditionsForAuditors: kdbSubject?.conditionsForAuditors,
            exchangeStudent: kdbSubject?.exchangeStudent,
            conditionsForExchangeStudents: kdbSubject?.conditionsForExchangeStudents,
            JaEnCourseName: kdbSubject?.JaEnCourseName,
            parentNumber: kdbSubject?.parentNumber,
            parentCourseName: kdbSubject?.parentCourseName,

            affiliation: {
                name: twinsSubject?.affiliation.name,
                code: twinsSubject?.affiliation.code,

                twinsRaw: twinsSubject && {
                    name: twinsSubject.raw[5],
                    code: twinsSubject.raw[3].onclick,
                },
            },

            kdbDataUpdateDate: kdbSubject?.dataUpdateDate,

            hierarchy: kdbSubject?.hierarchy || [],
        };
    });

    await writeFile(
        "output/subjects.merged.json",
        JSON.stringify(
            mergedSubjects,
            (_key, value) => {
                if (value instanceof Hierarchy) {
                    return value.toOutputJSON();
                }
                return value;
            },
            4
        ),
        "utf8"
    );

    await writeFile("output/irregularSubjects.txt", irregularSubjects.map((v) => `${v.key}: ${v.reason}`).join("\n"), "utf8");
};

main();
