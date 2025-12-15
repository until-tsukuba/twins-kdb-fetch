export type ParsedTwinsCeilType = string | { text: string; onclick: string };

export type ParsedTwinsTableType = {
    head: ParsedTwinsCeilType[];
    body: ParsedTwinsCeilType[][];
};
