import { getInstructionalType } from "./instructionalType.js";
import { SubjectRecord } from "./subjectRecord";

export type ReadableSubjectRecord = {
    courseNumber: string; // 科目番号
    courseName: string; // 科目名
    courseType: ReturnType<typeof getInstructionalType> & {
        code: string;
    }; // 授業方法
    credits: {
        text: string;
        value: number | null;
    }; // 単位数
    year: {
        text: string;
        value: number[];
    }; // 標準履修年次
    term: string; // 実施学期
    weekdayAndPeriod: string; // 曜時限
    classroom: string; // 教室
    instructor: string; // 担当教員
    overview: string; // 授業概要
    remarks: string; // 備考
    auditor: string; // 科目等履修生申請可否
    conditionsForAuditors: string; // 申請条件
    exchangeStudent: string; // 短期留学生申請可否
    conditionsForExchangeStudents: string; // 申請条件
    JaEnCourseName: string; // 英語(日本語)科目名
    parentNumber: string; // 科目コード
    parentCourseName: string; // 要件科目名
    dataUpdateDate: string; // データ更新日
};

const parseYear = (text: string) => {
    return text
        .split("・")
        .flatMap((t) => {
            if (t.includes("-")) {
                const [first, last] = t.split("-").map((v) => +v.trim());
                if (!(typeof first === "number" && typeof last === "number" && first <= last)) {
                    throw new Error(`Invalid year range: ${t}, ${text}`);
                }
                return [...Array(last - first + 1)].map((_, i) => i + first);
            } else {
                const val = +t;
                return [val];
            }
        })
        .sort((a, b) => a - b);
};

const parseCredit = (text: string) => {
    return text.trim() === "-" ? null : +text.trim();
};

export const readableSubject = (subject: SubjectRecord): ReadableSubjectRecord => {
    return {
        ...subject,
        courseType: {
            code: subject.courseType,
            ...getInstructionalType(subject.courseType),
        },
        year: {
            text: subject.year,
            value: parseYear(subject.year),
        },
        credits: {
            text: subject.credits,
            value: parseCredit(subject.credits),
        },
    };
};
