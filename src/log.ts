import { AsyncLocalStorage } from "node:async_hooks";
import { Serializable } from "./tree/dfs.js";

type ProcessingStepContext = "kdb-flat" | "kdb-tree" | "twins" | "merge";

type indexNContext = {
    index: number;
    length: number;
};

const withProcessingStep = new AsyncLocalStorage<ProcessingStepContext>();

const withProcessingContext = new AsyncLocalStorage<
    (
        | {
              type: "serializable";
              serializable: Serializable;
          }
        | {
              type: "indexN";
              indexN: indexNContext;
          }
        | {
              type: "subjectId";
              subjectId: string;
          }
    )[]
>();

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

const contextTexts = () => {
    const context = withProcessingContext.getStore();
    if (!context) {
        return [];
    }
    return context.map((c) => {
        if (c.type === "serializable") {
            return `[req: ${c.serializable.serialize().padStart(5, " ")}]`;
        } else if (c.type === "indexN") {
            return `[${c.indexN.index + 1}/${c.indexN.length}]`;
        } else if (c.type === "subjectId") {
            return `[subject: ${c.subjectId}]`;
        }
        return null;
    });
};

export const log = {
    info: (message: string) => {
        console.log([timeText(), stepTexts(), ...contextTexts(), message].filter((v) => v !== null).join(" "));
    },
};

export const runWithSubjectLogging = async <R>(subjectId: string, fn: () => R | Promise<R>): Promise<R> => {
    const current = withProcessingContext.getStore() ?? [];
    return await withProcessingContext.run(
        [
            ...current,
            {
                type: "subjectId",
                subjectId,
            },
        ],
        async () => {
            log.info("Start");
            const result = await fn();
            log.info("Finished");
            return result;
        },
    );
};

export const runWithIndexNLogging = async <R>(index: number, length: number, fn: () => R | Promise<R>): Promise<R> => {
    const current = withProcessingContext.getStore() ?? [];
    return await withProcessingContext.run(
        [
            ...current,
            {
                type: "indexN",
                indexN: { index, length },
            },
        ],
        async () => {
            log.info("Start");
            const result = await fn();
            log.info("Finished");
            return result;
        },
    );
};

export const wrapWithSerializableLogging = <N extends Serializable, R>(fn: (serializable: N) => R | Promise<R>): ((serializable: N) => Promise<R>) => {
    return async (serializable: N) => {
        const current = withProcessingContext.getStore() ?? [];
        return await withProcessingContext.run(
            [
                ...current,
                {
                    type: "serializable",
                    serializable,
                },
            ],
            async () => {
                log.info("Start");
                const result = await fn(serializable);
                log.info("Finished");
                return result;
            },
        );
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
