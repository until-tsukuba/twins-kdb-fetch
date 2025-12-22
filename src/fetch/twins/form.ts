import { password, utid_name, year } from "../../envs.js";
import { eventIds, flowIds } from "./statics.js";

export const generateTwinsSearchForm = (courseNumber: string) => {
    const form = new URLSearchParams({
        _eventId: eventIds.search,
        _displayCount: "15000",
        nendo: year,
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
        tabId: "home",
        wfId: flowIds.twinsLogin,
        locale: "ja_JP",
        action: "rwf",
        page: "",
    });

    return form;
};
