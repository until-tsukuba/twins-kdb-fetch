export type ParsedTwinsCeilType = string | { readonly text: string; readonly onclick: string };

export type ParsedTwinsTableType = {
    readonly head: readonly ParsedTwinsCeilType[];
    readonly body: readonly (readonly ParsedTwinsCeilType[])[];
};
