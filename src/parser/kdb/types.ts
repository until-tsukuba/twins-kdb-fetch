import { InstructionalType } from "../../util/instructionalType.js";

export type ParsedRequisiteType = {
    name: string;
    id: string;
    hasLower: boolean;
}[];

export type KdbSubjectRecord = {
    courseCode: string; // 科目番号
    courseName: string; // 科目名
    courseType: InstructionalType & {
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
    classroom: null; // 教室
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
