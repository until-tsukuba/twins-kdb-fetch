/**
 * @see https://www.tsukuba.ac.jp/education/g-courses-handbook/1-2.pdf
 */
const instructionalTypeMap = {
    "0": { text: "その他", flags: { 講義: false, 演習: false, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: true } },
    "1": { text: "講義", flags: { 講義: true, 演習: false, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: false } },
    "2": { text: "演習", flags: { 講義: false, 演習: true, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: false } },
    "3": { text: "実習･実験･実技", flags: { 講義: false, 演習: false, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } },
    "4": { text: "講義及び演習", flags: { 講義: true, 演習: true, "実習･実験･実技": false, "卒業論文･卒業研究等": false, その他: false } },
    "5": { text: "講義及び実習･実験･実技", flags: { 講義: true, 演習: false, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } },
    "6": { text: "演習及び実習･実験･実技", flags: { 講義: false, 演習: true, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } },
    "7": { text: "講義、演習及び実習･実験･実技", flags: { 講義: true, 演習: true, "実習･実験･実技": true, "卒業論文･卒業研究等": false, その他: false } },
    "8": { text: "卒業論文･卒業研究等", flags: { 講義: false, 演習: false, "実習･実験･実技": false, "卒業論文･卒業研究等": true, その他: false } },
} as const;

type InstructionalTypeCode = keyof typeof instructionalTypeMap;

function isInstructionalTypeCode(code: string): code is InstructionalTypeCode {
    return code in instructionalTypeMap;
}

export const getInstructionalType = (code: string): (typeof instructionalTypeMap)[InstructionalTypeCode] => {
    if (!isInstructionalTypeCode(code)) {
        throw new Error(`Unknown instructional type code: ${code}`);
    }
    return instructionalTypeMap[code];
};

export type InstructionalType = (typeof instructionalTypeMap)[InstructionalTypeCode];
