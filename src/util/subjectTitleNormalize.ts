const titleNormalizationCharMap: Map<string, string> = new Map([
    ["Ⅰ", "I"],
    ["Ⅱ", "II"],
    ["Ⅲ", "III"],
    ["Ⅳ", "IV"],
    ["Ⅴ", "V"],
    ["Ⅵ", "VI"], // 2165

    ["１", "1"], // ff11
    ["２", "2"], // ff12

    ["Ｉ", "I"], // ff29

    ["！", "!"], // ff01
    ["＆", "&"], // ff06
    ["（", "("], // ff08
    ["）", ")"], // ff09
    ["，", ","], // ff0c
    ["／", "/"], // ff0f
    ["：", ":"], // ff1a
    ["～", "~"], // ff5e

    ["〜", "～"], // 301c -> ff5e
    [" ", " "], // 00a0 nbsp

    ["⽣", "生"], // 2f63 -> 751f
]);

export const normalizeSubjectTitle = (title: string): string => {
    const normalizedTitle = title
        .split("")
        .map((char) => titleNormalizationCharMap.get(char) ?? char)
        .join("")
        .replaceAll("  ", " ");
    return normalizedTitle;
};
