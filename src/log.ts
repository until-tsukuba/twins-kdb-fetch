import { AsyncLocalStorage } from "node:async_hooks";
import { Requisite } from "./util/requisite.js";

type ProcessingStepContext = "kdb-flat" | "kdb-tree" | "twins" | "merge";

type RequisiteContext = Requisite;

type indexNContext = {
    index: number;
    length: number;
};

const withProcessingStep = new AsyncLocalStorage<ProcessingStepContext>();
const withProcessingRequisites = new AsyncLocalStorage<RequisiteContext>();
const withProcessingSubject = new AsyncLocalStorage<string>();
const withProcessingIndexN = new AsyncLocalStorage<indexNContext>();

const stepNum = (step: ProcessingStepContext): number => {
    return {
        "kdb-tree": 1,
        "kdb-flat": 2,
        twins: 3,
        merge: 4,
    }[step];
};

const timeText = (): string => {
    const now = new Date();
    return `[${now.toISOString()}]`;
};

const stepTexts = (): string => {
    const step = withProcessingStep.getStore();
    return step ? `[${step.padEnd(8, " ")}: ${stepNum(step)}/4]` : `[unknown: ?/4]`;
};

const subjectIdText = () => {
    const subjectId = withProcessingSubject.getStore();
    if (!subjectId) {
        return null;
    }
    return `[subject ${subjectId}]`;
};

const requisiteText = () => {
    const requisites = withProcessingRequisites.getStore();
    if (!requisites) {
        return null;
    }
    return `[requisites: ${requisites.serialize().padStart(5, " ")}]`;
};

const indexNText = () => {
    const indexN = withProcessingIndexN.getStore();
    if (!indexN) {
        return null;
    }
    return `[${indexN.index + 1}/${indexN.length}]`;
};

export const log = {
    info: (message: string) => {
        console.log([timeText(), stepTexts(), requisiteText(), subjectIdText(), indexNText(), message].filter((v) => v !== null).join(" "));
    },
};

export const runWithIndexNLogging = <A extends unknown[], R>(index: number, length: number, fn: (...args: A) => R | Promise<R>, ...args: A): Promise<R> => {
    return withProcessingIndexN.run({ index, length }, async () => {
        log.info("Start");
        const result = await fn(...args);
        log.info("Finished");
        return result;
    });
};

export const runWithSubjectLogging = async <R>(subjectId: string, fn: () => R | Promise<R>): Promise<R> => {
    return await withProcessingSubject.run(subjectId, async () => {
        log.info("Start");
        const result = await fn();
        log.info("Finished");
        return result;
    });
};

export const runWithRequisiteLogging = <R>(requisite: Requisite, fn: (requisite: Requisite) => R | Promise<R>): Promise<R> => {
    return withProcessingRequisites.run(requisite, async () => {
        log.info("Start");
        const result = await fn(requisite);
        log.info("Finished");
        return result;
    });
};

export const wrapWithRequisiteLogging = <R>(fn: (requisite: Requisite) => R | Promise<R>): ((requisite: Requisite) => Promise<R>) => {
    return async (requisite: Requisite) => {
        return await withProcessingRequisites.run(requisite, async () => {
            log.info("Start");
            const result = await fn(requisite);
            log.info("Finished");
            return result;
        });
    };
};

export const wrapWithStepLogging = <A extends unknown[], R>(step: ProcessingStepContext, fn: (...args: A) => R | Promise<R>): ((...args: A) => Promise<R>) => {
    return (...args: A) =>
        withProcessingStep.run(step, async () => {
            log.info("Start");
            const result = await fn(...args);
            log.info("Finished");
            return result;
        });
};
