import { year } from "../../envs.js";

export const generateKdBFirstRequisitesForm = () => {
    const form = new URLSearchParams({
        widgetId: "SB0070",
        widgetAction: "searchAjax",
        widgetFirst: "first",
        breadcrumbName: "",
        widgetIndex: "",
        "widgetOpts[widgetId]": "SB0070_Requisites",
    });
    return form;
};

export const generateKdBLowerRequisitesForm = (requisiteCode: string) => {
    const form = new URLSearchParams({
        widgetId: "SB0070",
        widgetAction: "searchAjax",
        widgetFirst: "lower",
        breadcrumbName: "", // non XSS safe
        widgetIndex: "",
        "widgetOpts[widgetId]": "SB0070_Requisites",
        widgetParamRequisites: requisiteCode,
    });
    return form;
};

export const generateKdBCsvDownloadForm = (requisiteCode: string) => {
    const form = new URLSearchParams({
        pageId: "SB0070",
        action: "downloadList",
        hdnFy: year,
        hdnTermCode: "",
        hdnDayCode: "",
        hdnPeriodCode: "",
        hdnAgentName: "",
        hdnOrg: "",
        hdnIsManager: "",
        hdnReq: requisiteCode,
        hdnFac: "",
        hdnDepth: "",
        hdnChkSyllabi: "false",
        hdnChkAuditor: "false",
        hdnChkExchangeStudent: "false",
        hdnChkConductedInEnglish: "false",
        hdnCourse: "",
        hdnKeywords: "",
        hdnFullname: "",
        hdnDispDay: "",
        hdnDispPeriod: "",
        hdnOrgName: "",
        hdnReqName: "SSAAAA",
        cmbDwldtype: "csv",
    });
    return form;
};
