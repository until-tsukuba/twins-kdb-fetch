import "dotenv/config";

export const utid_name = process.env.UTID_NAME ?? "";
export const password = process.env.PASSWORD ?? "";
export const twinsHost = process.env.TWINS ?? "https://twins.tsukuba.ac.jp";
export const kdbHost = process.env.KDB ?? "https://kdb.tsukuba.ac.jp";
export const year = process.env.YEAR ?? "2025";
export const useCache = process.env.USE_CACHE?.toLowerCase() === "true";
