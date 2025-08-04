import { password, utid_name } from "../envs.js";
import { Hierarchy } from "../util/types.js";
import { eventIds, flowIds } from "./statics.js";

export const generateKdbSearchForm = (eventId: string, index: string, hierarchy: Hierarchy) => {
    const hierarchyId = hierarchy.getHierarchyIds();
    const form = new URLSearchParams({
        _eventId: eventId,
        index: index,
        locale: "",
        nendo: "2025",
        termCode: "",
        dayCode: "",
        periodCode: "",
        hierarchy1: hierarchyId[0] ?? "",
        hierarchy2: hierarchyId[1] ?? "",
        hierarchy3: hierarchyId[2] ?? "",
        hierarchy4: hierarchyId[3] ?? "",
        hierarchy5: hierarchyId[4] ?? "",
        freeWord: "",
        _orFlg: "1",
        _andFlg: "1",
        _gaiyoFlg: "1",
        _syllabiFlg: "1",
        _engFlg: "1",
        _risyuFlg: "1",
        _ryugakuFlg: "1",
        _excludeFukaikoFlg: "1",
        outputFormat: "0",
    });
    return form;
};

export const generateTwinsSearchForm = (eventId: string, courseNumber: string) => {
    const form = new URLSearchParams({
        _eventId: eventIds.twins.search,
        _displayCount: "15000",
        nendo: "2025",
        // _rishukikanflag: "1",
        // _senchakukamokuflag: "1",
        jikanwaricdLike: courseNumber,
    });

    return form;
};

export const generateTwinsLoginForm = () => {
    const form = new URLSearchParams({
        userName: utid_name,
        password: password,
        tabId: "main",
        wfId: flowIds.twinsLogin,
        locale: "ja_JP",
        action: "rwf",
    });

    return form;
};
