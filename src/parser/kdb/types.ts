import { getInstructionalType } from "../../util/instructionalType";

export type ParsedRequisiteType = {
    name: string;
    id: string;
    hasLower: boolean;
}[];

export type ParsedSearchResultType = {
    code: string;
    title: string;
    syllabusLatestLink: string | null;
    style: string;
    credit: string;
    grade: string;
    term: string | null;
    day: string | null;
    agent: string | null;
    body: string | null;
    remark: string;
    auditor: string | null;
    auditorReason: string | null;
}[];

export type KdbSubjectRecord = {
    courseCode: string; // 科目番号
    courseName: string; // 科目名
    syllabusLatestLink: string | null; // シラバス最新リンク
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
    term: string | null; // 実施学期
    weekdayAndPeriod: string | null; // 曜時限
    classroom: string | null; // 教室
    instructor: string | null; // 担当教員
    overview: string | null; // 授業概要
    remarks: string; // 備考
    auditor: string | null; // 科目等履修生申請可否
    conditionsForAuditors: string | null; // 申請条件
};
