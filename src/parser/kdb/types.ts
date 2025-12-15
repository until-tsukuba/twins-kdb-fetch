import { InstructionalType } from "../../util/instructionalType.js";

export type ParsedRequisiteType = readonly {
    readonly name: string;
    readonly id: string;
    readonly hasLower: boolean;
}[];

export type KdbSubjectRecord = {
    readonly courseCode: string; // 科目番号
    readonly courseName: string; // 科目名
    readonly courseType: InstructionalType & {
        readonly code: string;
    }; // 授業方法
    readonly credits: {
        readonly text: string;
        readonly value: number | null;
    }; // 単位数
    readonly year: {
        readonly text: string;
        readonly value: readonly number[];
    }; // 標準履修年次
    readonly term: string; // 実施学期
    readonly weekdayAndPeriod: string; // 曜時限
    readonly classroom: null; // 教室
    readonly instructor: string; // 担当教員
    readonly overview: string; // 授業概要
    readonly remarks: string; // 備考
    readonly auditor: string; // 科目等履修生申請可否
    readonly conditionsForAuditors: string; // 申請条件
    readonly exchangeStudent: string; // 短期留学生申請可否
    readonly conditionsForExchangeStudents: string; // 申請条件
    readonly JaEnCourseName: string; // 英語(日本語)科目名
    readonly parentNumber: string; // 科目コード
    readonly parentCourseName: string; // 要件科目名
    readonly dataUpdateDate: string; // データ更新日
};
