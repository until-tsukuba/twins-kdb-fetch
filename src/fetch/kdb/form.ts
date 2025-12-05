import { year } from "../../envs";

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

export const generateKdBSearchForm = (requisiteCode: string, page: number) => {
    const form = new URLSearchParams({
        pageId: "SB0070",
        action: "search",
        txtFy: year,
        cmbTerm: "",
        cmbDay: "",
        cmbPeriod: "",
        hdnOrg: "",
        hdnReq: requisiteCode, // requisite
        hdnFac: "",
        hdnDepth: "",
        chkSyllabi: "false",
        chkAuditor: "false",
        chkExchangeStudent: "false",
        chkConductedInEnglish: "false",
        txtSyllabus: "", // search keyword
        appendSchedule: "",
        page: "" + page,
        total: "-1",
    });
    return form;
};

export const generateKdBSubjectOverviewForm = (subjectId: string) => {
    const form = new URLSearchParams({
        pageId: "SB0070",
        action: "searchContents",
        txtFy: "2025",
        txtCourse: subjectId,
        txtSubcourse: "0",
    });
    return form;
};
