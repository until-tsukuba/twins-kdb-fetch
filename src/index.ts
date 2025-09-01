import { writeFile, mkdir } from "fs/promises";
import { getKdbTreeData } from "./kdbTree.js";
import { getKdbFlatData } from "./kdbFlat.js";
import { ModuleTimeTable, Terms } from "./parser/buildTwinsSubjectList";
import { getTwinsData } from "./twins.js";
import { InstructionalType } from "./util/instructionalType";
import { Hierarchy } from "./util/types.js";
import { outputReplacer } from './util/jsonReplacer.js';

type MergedSubject = {
    code: string;
    name: string;
    instructionalType: {
        value: InstructionalType | null;
        kdbRaw: string | null;
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
            | null;
        kdbRaw: string | null;
    };
    year: {
        value: number[];
        kdbRaw: string | null;
        twinsRaw: string | null;
    };
    terms: {
        term: Terms | null;
        module: string | null;
        weekdayAndPeriod: string | null;
        moduleTimeTable: ModuleTimeTable | null;

        twinsRaw: {
            term: string;
            module: string;
        } | null;
    };
    classroom: null;
    instructor: {
        value: string[];

        kdbRaw: string | null;
        twinsRaw: string | null;
    };
    overview: string | null;
    remarks: string | null;
    auditor: string | null;
    conditionsForAuditors: string | null;
    exchangeStudent: string | null;
    conditionsForExchangeStudents: string | null;
    JaEnCourseName: string | null;
    parentNumber: string | null;
    parentCourseName: string | null;

    affiliation: {
        name: string | null;
        code: string | null;

        twinsRaw: {
            name: string;
            code: string;
        } | null;
    };

    kdbDataUpdateDate: string | null;

    hierarchy: Hierarchy[];
};

const arrayShallowEqual = <T>(a: T[], b: T[]): boolean => {
    if (a.length !== b.length) return false;
    // use every
    return a.every((value, index) => value === b[index]);
};

const main = async () => {
    await mkdir("output", { recursive: true });

    console.log("Start fetching data...");

    console.log("Start fetching kdb flat data...");
    const kdbFlat = await getKdbFlatData();
    console.log("Finished fetching kdb flat data.");

    console.log("Start fetching twins data...");
    const twins = await getTwinsData();
    console.log("Finished fetching twins data.");

    console.log("Start fetching kdb tree data...");
    const kdbTree = await getKdbTreeData();
    console.log("Finished fetching kdb tree data.");

    console.log("Finished fetching data.");

    const kdbFlatSubjectsMap = new Map(kdbFlat.map((subject) => [subject.courseNumber, subject]));
    const kdbTreeSubjectsMap = new Map(kdbTree.subjectsFlatList.map((subject) => [subject.courseNumber, subject]));
    const twinsSubjectsMap = new Map(twins.map((subject) => [subject.code, subject]));

    const mergedKey = [...new Set([...kdbFlatSubjectsMap.keys(), ...kdbTreeSubjectsMap.keys(), ...twinsSubjectsMap.keys()])];

    const irregularSubjects: { key: string; reason: string }[] = [];

    const mergedSubjects: MergedSubject[] = mergedKey.map((key) => {
        console.log(`Processing subject: ${key}`);

        const kdbFlatSubject = kdbFlatSubjectsMap.get(key);
        const kdbTreeSubject = kdbTreeSubjectsMap.get(key);
        const twinsSubject = twinsSubjectsMap.get(key);

        if (!kdbFlatSubject && !kdbTreeSubject && !twinsSubject) {
            throw new Error(`No subject found for key: ${key}`);
        }

        if (!kdbFlatSubject) {
            console.warn(`* Subject ${key} not found in kdb flat data`);
            irregularSubjects.push({
                key,
                reason: "Not found in kdb flat data",
            });
        }
        if (!kdbTreeSubject) {
            console.warn(`* Subject ${key} not found in kdb tree data`);
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

        const creditValue = (() => {
            if (!kdbFlatSubject) return null;
            if (typeof kdbFlatSubject?.credits.value === "number") {
                return { type: "number", value: kdbFlatSubject.credits.value } as const;
            }
            return { type: "none" } as const;
        })();

        return {
            code: key,
            // 8310205
            name: choose(twinsSubject?.name, kdbFlatSubject?.courseName),
            instructionalType: {
                value: kdbFlatSubject?.courseType ?? null,
                kdbRaw: kdbFlatSubject?.courseType.code ?? null,
            },
            credits: {
                value: creditValue,
                kdbRaw: kdbFlatSubject?.credits.text ?? null,
            },
            year: {
                // BB11451
                value: choose(twinsSubject?.year, kdbFlatSubject?.year.value, arrayShallowEqual),
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
                    kdbFlatSubject?.instructor.split(/,、，/).map((s) => s.trim())
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

            hierarchy: kdbTreeSubject?.hierarchy || [], // kdbTreeSubject
        };
    });

    await writeFile(
        "output/subjects.merged.json",
        JSON.stringify(
            mergedSubjects,
            outputReplacer,
            4
        ),
        "utf8"
    );

    await writeFile("output/irregularSubjects.txt", irregularSubjects.map((v) => `${v.key}: ${v.reason}`).join("\n"), "utf8");
};

main();
