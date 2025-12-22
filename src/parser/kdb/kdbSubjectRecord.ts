export const commonHeader = [
    { key: "courseNumber", text: "科目番号" },
    { key: "courseName", text: "科目名" },
    { key: "courseType", text: "授業方法" },
    { key: "credits", text: "単位数" },
    { key: "year", text: "標準履修年次" },
    { key: "term", text: "実施学期" },
    { key: "weekdayAndPeriod", text: "曜時限" },
    // { key: "classroom", text: "教室" },
    { key: "instructor", text: "担当教員" },
    { key: "overview", text: "授業概要" },
    { key: "remarks", text: "備考" },
    { key: "auditor", text: "科目等履修生履修可否" },
    { key: "conditionsForAuditors", text: "申請条件" },
    { key: "exchangeStudent", text: "短期留学生申請可否" },
    { key: "conditionsForExchangeStudents", text: "申請条件" },
    { key: "JaEnCourseName", text: "英語(日本語)科目名" },
    { key: "parentNumber", text: "科目コード" },
    { key: "parentCourseName", text: "要件科目名" },
    { key: "dataUpdateDate", text: "データ更新日" },
] as const;

export type RawKdbSubjectRecord = Record<(typeof commonHeader)[number]["key"], string>;
