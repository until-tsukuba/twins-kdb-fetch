import "dotenv/config";

export const utid_name = process.env.UTID_NAME ?? "";
export const password = process.env.PASSWORD ?? "";
export const twinsHost = process.env.TWINS ?? "https://twins.tsukuba.ac.jp";
export const kdbHost = process.env.KDB ?? "https://kdb.tsukuba.ac.jp";
const academicYear = (() => {
	const now = new Date();
	return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
})();
export const year = process.env.YEAR ?? (academicYear + '');
export const useCache = process.env.USE_CACHE?.toLowerCase() === "true";
