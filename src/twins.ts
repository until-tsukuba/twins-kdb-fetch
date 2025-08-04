import { writeFile } from "fs/promises";
import endpoints from "./fetch/endpoints.js";
import { parseTwinsHtml } from "./parser/parseTwinsHtml.js";
import { buildTwinsSubjectList } from "./parser/buildTwinsSubjectList.js";

export const getTwinsData = async () => {
    const loginFlow = await endpoints.twins.login();
    const initialFlow = await endpoints.twins.init(loginFlow);
    const inputFlow = await endpoints.twins.subjectInput(initialFlow);
    const jikanwariFlow = await endpoints.twins.jikanwariSearch(inputFlow);
    const red = await endpoints.twins.searchTwins(jikanwariFlow, "");
    const htmlBody = await endpoints.getContent(red, "utf8");
    const table = await parseTwinsHtml(htmlBody);

    const twinsData = buildTwinsSubjectList(table);
    await writeFile("output/subjects.twins.json", JSON.stringify(twinsData, null, 4), "utf8");

    return twinsData;
};

// getTwinsData();
