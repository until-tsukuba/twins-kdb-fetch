# twins-kdb-fetch
## About
**このプログラムでは認証が必要な`https://twins.tsukuba.ac.jp/`にはアクセスしていません。**

TWINSの科目検索ページにはKdBよりもパースしやすいデータがあります。
このプログラムではダウンロードした科目データを使いやすくパースしています。

[最新のデータをリリースからダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest)

## データフォーマット

```typescript
type Terms = { text: "春学期", code: "A" } | { text: "秋学期", code: "B" };
type DaysOfWeek = "月" | "火" | "水" | "木" | "金" | "土" | "日" | "他";
type Periods = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type TimeTable = {
    day: DaysOfWeek; // 曜日
    period: Periods | null; // 時限
};
type Module = "springA" | "springB" | "springC" | "summerVacation" | "fallA" | "fallB" | "fallC" | "springVacation";
type ModuleTimeTable = Record<Module, TimeTable[]>;

type TwinsSubject = {
    name: string; // 科目名
    code: string; // 科目番号
    term: Terms;
    moduleTimeTable: ModuleTimeTable;
    instructors: string[]; // 担当教員
    affiliation: {
        name: string; // 開設所属名
        code: string; // 開設所属コード
    };
    year: number[]; // 標準履修年次

    raw: [term: string, module: string, code: string, title: { text: string; onclick: string }, instructor: string, affiliation: string, year: string];
};

type Hierarchy = { value: string | null; text: string }[];

type InstructionalType = 
    | { text: "その他", flags: { 講義: false, 演習: false, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: true } }
    | { text: "講義", flags: { 講義: true, 演習: false, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "演習", flags: { 講義: false, 演習: true, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "実習･実験･実技", flags: { 講義: false, 演習: false, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "講義及び演習", flags: { 講義: true, 演習: true, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "講義及び実習･実験･実技", flags: { 講義: true, 演習: false, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "演習及び実習･実験･実技", flags: { 講義: false, 演習: true, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "講義、演習及び実習･実験･実技", flags: { 講義: true, 演習: true, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } }
    | { text: "卒業論文･卒業研究等", flags: { 講義: false, 演習: false, "実習･実験･実技": false, "卒業論文･卒業研究等": true, その他: false } }

type SubjectRecord = {
    courseNumber: string; // 科目番号
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
    hierarchy: Hierarchy[];
}

type SubjectRecordWithHierarchy = SubjectRecord & { hierarchy: Hierarchy[]; };

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

        twinsRaw:
            | {
                  term: string;
                  module: string;
              }
            | null;
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

        twinsRaw:
            | {
                  name: string;
                  code: string;
              }
            | null;
    };

    kdbDataUpdateDate: string | null;

    hierarchy: Hierarchy[];
};

type SubjectNode = {
    type: "subject";
    node: Hierarchy;
    subject: SubjectRecord;
    children: null;
};

type SubCategoryNode = {
    type: "sub_category";
    node: Hierarchy;
    children: SubjectNode[];
};

type TreeNode = 
    | {
          type: "internal";
          node: Hierarchy;
          children: TreeNode[];
      }
    | {
          type: "leaf";
          node: Hierarchy;
          children: (SubCategoryNode | SubjectNode)[];
      };
```

### output/subjects.merged.json
[最新のデータをダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/subjects.merged.json)

全てを合わせたデータ

型: `MergedSubject[]`

### output/tree.kdb.json
[最新のデータをダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/tree.kdb.json)

KdBから取得した木構造のデータ

型: `TreeNode[]`

### output/subjects.flat.kdb.json
[最新のデータをダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/subjects.flat.kdb.json)

KdBから取得した木構造のデータをフラットにしたもの

型: `SubjectRecordWithHierarchy[]`

### output/hierarchy.kdb.txt
[最新のデータをダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/hierarchy.kdb.txt)

KdBのhierarchyのデータをテキストで読めるもの

### output/subjects.twins.json
[最新のデータをダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/subjects.twins.json)

TWINSから持ってきたデータ

型: `TwinsSubject[]`

### output/irregularSubjects.txt
[最新のデータをダウンロード](https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/irregularSubjects.txt)

TWINSとKdBで異なるデータ

## 最新のデータをダウンロードするスクリプト
以下のスクリプトを実行すると、最新の科目データを`src/content/subjects.merged.json`にダウンロードします。

```bash
#!/usr/bin/env bash

curl -Lo src/content/subjects.merged.json "https://github.com/until-tsukuba/twins-kdb-fetch/releases/latest/download/subjects.merged.json"
```

## 導入
```sh
$ git clone https://github.com/until-tsukuba/twins-kdb-fetch.git && npm ci
```

## 使い方

```
$ cp .env_template .env
$ vim .env
$ npm run build && npm run start
```

または

```sh
$ npm run build && UTID_NAME=s******* PASSWORD=******** npm run start
```
