import { log, runWithSubjectLogging } from "../../log.js";
import { mapSeries } from "../../util/mapSeries.js";
import { ParsedTwinsTableType } from "./types.js";
import { assertCeilIsString } from "./util.js";

const twinsHeader = [
    { key: null, text: "No." },
    { key: "term", text: "学期" },
    { key: "module", text: "実施モジュール(曜時限)" },
    { key: "courseCode", text: "科目番号" },
    { key: "courseTitle", text: "科目" },
    { key: "instructor", text: "担当" },
    { key: "affiliation", text: "開設所属" },
    { key: "year", text: "標準履修年次" },
    { key: "syllabus", text: "シラバス" },
] as const;

const terms = [
    { text: "春学期", code: "A" },
    { text: "秋学期", code: "B" },
] as const;
export type Terms = (typeof terms)[number];

const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日", "他"] as const;
export type DaysOfWeek = (typeof daysOfWeek)[number];

const periods = [1, 2, 3, 4, 5, 6, 7, 8] as const;
type Periods = (typeof periods)[number];

type TimeTable = {
    readonly day: DaysOfWeek; // 曜日
    readonly period: Periods | null; // 時限
};

type Module = "springA" | "springB" | "springC" | "summerVacation" | "fallA" | "fallB" | "fallC" | "springVacation";
export type ModuleTimeTable = Readonly<Record<Module, readonly TimeTable[]>>;

export type TwinsSubject = {
    readonly name: string; // 科目名
    readonly code: string; // 科目番号
    readonly term: Terms;
    readonly moduleTimeTable: ModuleTimeTable;
    readonly instructors: readonly string[]; // 担当教員
    readonly affiliation: {
        readonly name: string; // 開設所属名
        readonly code: string; // 開設所属コード
    };
    readonly year: readonly number[]; // 標準履修年次
    readonly raw: readonly [term: string, module: string, code: string, title: { text: string; onclick: string }, instructor: string, affiliation: string, year: string];
};

const assertValidHeader = (header: ParsedTwinsTableType["head"]) => {
    if (header.length !== twinsHeader.length) {
        throw new Error(`Header length mismatch: expected ${twinsHeader.length}, got ${header.length}`);
    }
    for (let i = 0; i < twinsHeader.length; i++) {
        const expectHeader = twinsHeader[i]?.text;
        const headValue = header[i];
        if (!headValue) {
            throw new Error(`Header at index ${i} is undefined`);
        }
        if (typeof headValue !== "string") {
            throw new Error(`Header at index ${i} is not a string: ${JSON.stringify(headValue)}`);
        }
        if (expectHeader !== headValue) {
            throw new Error(`Header mismatch at index ${i}: expected "${expectHeader}", got "${headValue}"`);
        }
    }
};

// type better includes
const includes = <T>(arr: readonly T[], value: unknown): value is T => {
    return (arr as readonly unknown[]).includes(value);
};

const parseTimeTable = (timeTableString: string): TimeTable => {
    // "火2" "他" "他1" "月"
    if (!(timeTableString.length === 1 || timeTableString.length === 2)) {
        throw new Error(`Invalid time table string length: ${timeTableString}`);
    }
    const day = timeTableString[0];
    if (!includes(daysOfWeek, day)) {
        throw new Error(`Invalid day of week: ${day}`);
    }
    const periodChar = timeTableString[1];
    if (!periodChar) {
        return { day, period: null };
    }
    const period = +periodChar;
    if (!includes(periods, period)) {
        throw new Error(`Invalid period: ${period}`);
    }
    return { day, period };
};

const parseModule = (moduleString: string): Module => {
    const moduleMap: Record<string, Module> = {
        春A: "springA",
        春B: "springB",
        春C: "springC",
        夏休: "summerVacation",
        秋A: "fallA",
        秋B: "fallB",
        秋C: "fallC",
        春休: "springVacation",
    };

    const module = moduleMap[moduleString.trim()];
    if (!module) {
        throw new Error(`Invalid module: ${moduleString}`);
    }
    return module;
};

const parseModuleTimeTable = (moduleString: string): ModuleTimeTable => {
    // "春A(火1,火2)、春B(金5,金6)",
    // "秋C(木5,木6)",
    // "春A・春B・春C(他)",

    // parse
    const modTimes = moduleString
        .split("、")
        .map((v) => v.trim())
        .map((modTimeString) => {
            const p = modTimeString.split("(");
            if (p.length !== 2 || !p[0] || !p[1]) {
                throw new Error(`Invalid module format: ${modTimeString}`);
            }
            const moduleString = p[0].trim();
            const modules = moduleString.split("・").map(parseModule);

            if (!p[1].endsWith(")")) {
                throw new Error(`Module string does not end with ')': ${modTimeString}`);
            }
            const timeTableString = p[1].slice(0, -1).trim();
            const timeTables = timeTableString
                .split(",")
                .map((t) => t.trim())
                .map(parseTimeTable);
            return { modules, timeTables };
        });

    const moduleTimeTable: Readonly<Record<Module, TimeTable[]>> = {
        springA: [],
        springB: [],
        springC: [],
        summerVacation: [],
        fallA: [],
        fallB: [],
        fallC: [],
        springVacation: [],
    };

    for (const { modules, timeTables } of modTimes) {
        for (const module of modules) {
            moduleTimeTable[module].push(...timeTables);
        }
    }

    return moduleTimeTable;
};

const parseTitleOnclick = (onclick: string) => {
    // see: 0A00319, 0A00508, 0AA3012, 0ABE341
    const match = onclick.match(/DataSet\('(\d+)','(\w+)','(\w+)','(\w+)','(.+)'\)/);
    if (!match) {
        throw new Error(`Invalid onclick format: ${onclick}`);
    }
    const [, nendoStr, termCode, affiliationCode, courseCode, title] = match;
    if (!nendoStr || !termCode || !affiliationCode || !courseCode || !title) {
        throw new Error(`Invalid onclick parameters: ${onclick}`);
    }

    const nendo = +nendoStr;
    if (isNaN(nendo)) {
        throw new Error(`Invalid nendo: ${nendoStr}`);
    }
    return { nendo, termCode, affiliationCode, courseCode, title: title.trim() };
};

const parseInstructors = (text: string): string[] => {
    // "宮内 久絵,秋山 肇,松島 亘志,アランニャ, クラウス"
    const instructorList = text
        .split(",")
        .map((instructor) => instructor.trim())
        .filter((instructor) => instructor);
    return instructorList;
};

const parseYear = (yearString: string): number[] => {
    // 1・2・3・4・5年

    if (!yearString.endsWith("年")) {
        throw new Error(`Year string does not end with '年': ${yearString}`);
    }
    return yearString
        .slice(0, -1)
        .split("・")
        .map((year) => year.trim())
        .map((year) => {
            const num = +year;
            if (isNaN(num)) {
                throw new Error(`Invalid year: ${year}`);
            }
            return num;
        });
};

const parseTerms = (text: string): Terms => {
    const term = terms.find((t) => t.text === text);
    if (!term) {
        throw new Error(`Invalid term: ${text}`);
    }
    return term;
};

const buildTwinsSubject = (row: ParsedTwinsTableType["body"][number]): Promise<TwinsSubject> => {
    return runWithSubjectLogging(typeof row[3] === "string" ? row[3] : (row[3]?.text ?? ""), () => {
        if (row.length !== twinsHeader.length) {
            throw new Error(`Row length mismatch: expected ${twinsHeader.length}, got ${row.length}`);
        }

        // skip
        const _subjectIndex = row[0];
        log.info(`Processing subject index: ${_subjectIndex}, ${row[3]}`);

        const termString = row[1];
        assertCeilIsString(termString);
        const term = parseTerms(termString);

        const moduleString = row[2];
        assertCeilIsString(moduleString);
        const moduleTimeTable = parseModuleTimeTable(moduleString);

        const courseCode = row[3];
        assertCeilIsString(courseCode);

        const courseTitle = row[4];
        if (typeof courseTitle !== "object" || !courseTitle.text || !courseTitle.onclick) {
            throw new Error(`Course title is not a valid object: ${JSON.stringify(courseTitle)}`);
        }
        const courseOnclick = parseTitleOnclick(courseTitle.onclick);
        if (courseOnclick.termCode !== term.code) {
            throw new Error(`Course term code mismatch: expected ${term.code}, got ${courseOnclick.termCode}`);
        }
        if (courseOnclick.courseCode !== courseCode) {
            throw new Error(`Course code mismatch: expected ${courseCode}, got ${courseOnclick.courseCode}`);
        }
        if (courseOnclick.title !== courseTitle.text) {
            throw new Error(`Course title mismatch: expected ${courseTitle.text}, got ${courseOnclick.title}`);
        }

        const instructors = row[5];
        assertCeilIsString(instructors);
        const instructorList = parseInstructors(instructors);

        const affiliation = row[6];
        assertCeilIsString(affiliation);

        const yearString = row[7];
        assertCeilIsString(yearString);
        const year = parseYear(yearString);

        return {
            name: courseTitle.text,
            code: courseCode,
            term,
            moduleTimeTable: moduleTimeTable,
            instructors: instructorList,
            affiliation: {
                name: affiliation,
                code: courseOnclick.affiliationCode,
            },
            year,
            raw: [termString, moduleString, courseCode, courseTitle, instructors, affiliation, yearString],
        };
    });
};

export const buildTwinsSubjectList = (tableData: ParsedTwinsTableType): Promise<TwinsSubject[]> => {
    // header check
    assertValidHeader(tableData.head);

    const subjects = mapSeries(tableData.body, buildTwinsSubject);
    return subjects;
};
