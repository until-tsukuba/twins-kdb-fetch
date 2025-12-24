import endpoints from "./fetch/endpoints.js";
import { parseTwinsHtml } from "./parser/twins/parseTwinsHtml.js";
import { buildTwinsSubjectList } from "./parser/twins/buildTwinsSubjectList.js";
import { wrapWithStepLogging } from "./log.js";
import { writeOutputJsonFile } from "./util/output.js";

export const getTwinsData = wrapWithStepLogging("twins", async () => {
    const initialFlow = await endpoints.twins.init();
    const loginFlow = await endpoints.twins.login(initialFlow);
    const rswFlow = await endpoints.twins.rsw(loginFlow);
    const inputFlow = await endpoints.twins.subjectInput(rswFlow);
    const jikanwariFlow = await endpoints.twins.jikanwariSearch(inputFlow);
    const red = await endpoints.twins.searchTwins(jikanwariFlow, "");
    const htmlBody = await endpoints.twins.getContent(red, "utf8");
    const table = await parseTwinsHtml(htmlBody);

    const twinsData = await buildTwinsSubjectList(table);
    await writeOutputJsonFile(twinsData, "subjects.twins.json");

    return twinsData;
});
