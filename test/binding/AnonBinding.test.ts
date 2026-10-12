/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */

import {AnonBinding, CancelFSMError, FSMImpl, LinearHistoryImpl} from "../../src/interacto";
import {InteractionStub} from "../interaction/InteractionStub";
import {StubCmd} from "../command/StubCmd";
import {afterEach, beforeEach, describe, expect, vi, test} from "vitest";
import {mock} from "vitest-mock-extended";
import type {Logger, LinearHistoryBase, LogLevel, When} from "../../src/interacto";

/**
 * Exposes the protected/private behaviour of AnonBinding so it can be unit-tested directly
 * (without having to drive a full interaction FSM).
 */
class AnonBindingStub extends AnonBinding<StubCmd, InteractionStub, unknown> {
    public setCommand(cmd: StubCmd | undefined): void {
        this._cmd = cmd;
    }

    public whenStartInvoke(): boolean {
        return super.whenStart();
    }

    public whenUpdateInvoke(): boolean {
        return super.whenUpdate();
    }

    public whenStopInvoke(): boolean {
        return super.whenStop();
    }
}

interface AnonOptions {
    loggers?: ReadonlyArray<LogLevel>;
    dynamicNodes?: ReadonlyArray<Node>;
    stopPropagation?: boolean;
    prevDefault?: boolean;
    timeoutThrottle?: number;
    cmdSupplier?: (d?: object) => StubCmd;
    firstFn?: (c: StubCmd, i: object, acc: unknown) => void;
    thenFn?: (c: StubCmd, i: object, acc: unknown) => void;
    whenFn?: Array<When<object, unknown>>;
    endFn?: (c: StubCmd, i: object, acc: unknown) => void;
    cancelFn?: (i: object, acc: unknown) => void;
    endOrCancelFn?: (i: object, acc: unknown) => void;
    hadEffectsFn?: (c: StubCmd, i: object, acc: unknown) => void;
    hadNoEffectFn?: (c: StubCmd, i: object, acc: unknown) => void;
    cannotExecFn?: (c: StubCmd, i: object, acc: unknown) => void;
    onErrFn?: (ex: unknown) => void;
    name?: string;
    accInit?: unknown;
}

describe(AnonBinding, () => {
    let binding: AnonBindingStub;
    let interaction: InteractionStub;
    let history: LinearHistoryBase;
    let logger: Logger;

    function createBinding(options: AnonOptions = {}): AnonBindingStub {
        return new AnonBindingStub(
            false,
            interaction,
            history,
            logger,
            options.cmdSupplier ?? ((): StubCmd => new StubCmd()),
            [],
            options.dynamicNodes ?? [],
            options.loggers ?? [],
            options.timeoutThrottle ?? 0,
            options.stopPropagation ?? false,
            options.prevDefault ?? false,
            new Map(),
            options.firstFn,
            options.thenFn,
            options.whenFn,
            options.endFn,
            options.cancelFn,
            options.endOrCancelFn,
            options.hadEffectsFn,
            options.hadNoEffectFn,
            options.cannotExecFn,
            options.onErrFn,
            options.name,
            options.accInit
        );
    }

    beforeEach(() => {
        logger = mock<Logger>();
        history = new LinearHistoryImpl();
        interaction = new InteractionStub(new FSMImpl(logger));
    });

    afterEach(() => {
        history.clear();
    });

    describe("constructor / configuration", () => {
        test("configures the loggers when some are given", () => {
            const log = vi.spyOn(interaction, "log");
            binding = createBinding({loggers: ["binding", "command", "usage", "interaction"]});

            expect(binding.logBinding).toBeTruthy();
            expect(binding.logCmd).toBeTruthy();
            expect(binding.logUsage).toBeTruthy();
            expect(log).toHaveBeenCalledWith(true);
        });

        test("keeps the default (disabled) loggers when none are given", () => {
            const log = vi.spyOn(interaction, "log");
            binding = createBinding({loggers: []});

            expect(binding.logBinding).toBeFalsy();
            expect(binding.logCmd).toBeFalsy();
            expect(binding.logUsage).toBeFalsy();
            expect(log).not.toHaveBeenCalled();
        });

        test("configures the interaction flags and registers dynamic nodes", () => {
            const node = document.createElement("div");
            binding = createBinding({
                dynamicNodes: [node],
                stopPropagation: true,
                prevDefault: true,
                timeoutThrottle: 42
            });

            expect(binding.interaction.stopImmediatePropagation).toBeTruthy();
            expect(binding.interaction.preventDefault).toBeTruthy();
            expect(binding.interaction.dynamicRegisteredNodes).toContain(node);
        });
    });

    describe("first", () => {
        test("calls the first callback with the command, data and accumulator", () => {
            const cmd = new StubCmd();
            const firstFn = vi.fn();
            binding = createBinding({firstFn, accInit: {foo: 1}});
            binding.setCommand(cmd);
            binding.accumulator = {foo: 1};

            binding.first();

            expect(firstFn).toHaveBeenCalledTimes(1);
            expect(firstFn).toHaveBeenCalledWith(cmd, interaction.data, binding.accumulator);
        });

        test("does nothing when no first callback is defined", () => {
            binding = createBinding();
            binding.setCommand(new StubCmd());

            expect(() => binding.first()).not.toThrow();
        });

        test("does nothing when no command is available", () => {
            const firstFn = vi.fn();
            binding = createBinding({firstFn});
            binding.setCommand(undefined);

            binding.first();

            expect(firstFn).not.toHaveBeenCalled();
        });

        test("catches errors thrown by the first callback", () => {
            const err = new Error("crash");
            binding = createBinding({firstFn: () => {
                throw err;
            }});
            binding.setCommand(new StubCmd());

            binding.first();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'first'", err);
        });
    });

    describe("then", () => {
        test("calls the then callback with the command, data and accumulator", () => {
            const cmd = new StubCmd();
            const thenFn = vi.fn();
            binding = createBinding({thenFn});
            binding.setCommand(cmd);

            binding.then();

            expect(thenFn).toHaveBeenCalledWith(cmd, interaction.data, binding.accumulator);
        });

        test("does nothing when no then callback is defined", () => {
            binding = createBinding();
            binding.setCommand(new StubCmd());

            expect(() => binding.then()).not.toThrow();
        });

        test("does nothing when no command is available", () => {
            const thenFn = vi.fn();
            binding = createBinding({thenFn});

            binding.then();

            expect(thenFn).not.toHaveBeenCalled();
        });

        test("catches errors thrown by the then callback", () => {
            const err = new Error("crash");
            binding = createBinding({thenFn: () => {
                throw err;
            }});
            binding.setCommand(new StubCmd());

            binding.then();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'then'", err);
        });
    });


    describe("end", () => {
        test("calls the end callback with the command, data and accumulator", () => {
            const cmd = new StubCmd();
            const endFn = vi.fn();
            binding = createBinding({endFn});
            binding.setCommand(cmd);

            binding.end();

            expect(endFn).toHaveBeenCalledWith(cmd, interaction.data, binding.accumulator);
        });

        test("does nothing when no end callback is defined", () => {
            binding = createBinding();
            binding.setCommand(new StubCmd());

            expect(() => binding.end()).not.toThrow();
        });

        test("does nothing when no command is available", () => {
            const endFn = vi.fn();
            binding = createBinding({endFn});

            binding.end();

            expect(endFn).not.toHaveBeenCalled();
        });

        test("catches errors thrown by the end callback", () => {
            const err = new Error("crash");
            binding = createBinding({endFn: () => {
                throw err;
            }});
            binding.setCommand(new StubCmd());

            binding.end();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'end'", err);
        });
    });

    describe("cancel", () => {
        test("calls the cancel callback with the data and accumulator", () => {
            const cancelFn = vi.fn();
            binding = createBinding({cancelFn, accInit: {foo: 1}});
            binding.accumulator = {foo: 1};

            binding.cancel();

            expect(cancelFn).toHaveBeenCalledWith(interaction.data, binding.accumulator);
        });

        test("does nothing when no cancel callback is defined", () => {
            binding = createBinding();

            expect(() => binding.cancel()).not.toThrow();
        });

        test("catches errors thrown by the cancel callback", () => {
            const err = new Error("crash");
            binding = createBinding({cancelFn: () => {
                throw err;
            }});

            binding.cancel();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'cancel'", err);
        });
    });

    describe("endOrCancel", () => {
        test("calls the endOrCancel callback with the data and accumulator", () => {
            const endOrCancelFn = vi.fn();
            binding = createBinding({endOrCancelFn, accInit: {foo: 1}});
            binding.accumulator = {foo: 1};

            binding.endOrCancel();

            expect(endOrCancelFn).toHaveBeenCalledWith(interaction.data, binding.accumulator);
        });

        test("does nothing when no endOrCancel callback is defined", () => {
            binding = createBinding();

            expect(() => binding.endOrCancel()).not.toThrow();
        });

        test("catches errors thrown by the endOrCancel callback", () => {
            const err = new Error("crash");
            binding = createBinding({endOrCancelFn: () => {
                throw err;
            }});

            binding.endOrCancel();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'endOrCancel'", err);
        });
    });


    describe("ifCmdHadNoEffect", () => {
        test("calls the hadNoEffect callback when it exists and a command is present", () => {
            const cmd = new StubCmd();
            const hadNoEffectFn = vi.fn();
            binding = createBinding({hadNoEffectFn});
            binding.setCommand(cmd);

            binding.ifCmdHadNoEffect();

            expect(hadNoEffectFn).toHaveBeenCalledWith(cmd, interaction.data, binding.accumulator);
        });

        test("does nothing without a callback", () => {
            binding = createBinding();
            binding.setCommand(new StubCmd());

            expect(() => binding.ifCmdHadNoEffect()).not.toThrow();
        });

        test("does nothing without a command", () => {
            const hadNoEffectFn = vi.fn();
            binding = createBinding({hadNoEffectFn});

            binding.ifCmdHadNoEffect();

            expect(hadNoEffectFn).not.toHaveBeenCalled();
        });

        test("catches errors thrown by the hadNoEffect callback", () => {
            const err = new Error("crash");
            binding = createBinding({hadNoEffectFn: () => {
                throw err;
            }});
            binding.setCommand(new StubCmd());

            binding.ifCmdHadNoEffect();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifHadNoEffect'", err);
        });
    });

    describe("ifCmdHadEffects", () => {
        test("calls the hadEffects callback when it exists and a command is present", () => {
            const cmd = new StubCmd();
            const hadEffectsFn = vi.fn();
            binding = createBinding({hadEffectsFn});
            binding.setCommand(cmd);

            binding.ifCmdHadEffects();

            expect(hadEffectsFn).toHaveBeenCalledWith(cmd, interaction.data, binding.accumulator);
        });

        test("does nothing without a callback", () => {
            binding = createBinding();
            binding.setCommand(new StubCmd());

            expect(() => binding.ifCmdHadEffects()).not.toThrow();
        });

        test("does nothing without a command", () => {
            const hadEffectsFn = vi.fn();
            binding = createBinding({hadEffectsFn});

            binding.ifCmdHadEffects();

            expect(hadEffectsFn).not.toHaveBeenCalled();
        });

        test("catches errors thrown by the hadEffects callback", () => {
            const err = new Error("crash");
            binding = createBinding({hadEffectsFn: () => {
                throw err;
            }});
            binding.setCommand(new StubCmd());

            binding.ifCmdHadEffects();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifHadEffects'", err);
        });
    });

    describe("ifCannotExecuteCmd", () => {
        test("calls the cannotExec callback when it exists and a command is present", () => {
            const cmd = new StubCmd();
            const cannotExecFn = vi.fn();
            binding = createBinding({cannotExecFn});
            binding.setCommand(cmd);

            binding.ifCannotExecuteCmd();

            expect(cannotExecFn).toHaveBeenCalledWith(cmd, interaction.data, binding.accumulator);
        });

        test("does nothing without a callback", () => {
            binding = createBinding();
            binding.setCommand(new StubCmd());

            expect(() => binding.ifCannotExecuteCmd()).not.toThrow();
        });

        test("does nothing without a command", () => {
            const cannotExecFn = vi.fn();
            binding = createBinding({cannotExecFn});

            binding.ifCannotExecuteCmd();

            expect(cannotExecFn).not.toHaveBeenCalled();
        });

        test("catches errors thrown by the cannotExec callback", () => {
            const err = new Error("crash");
            binding = createBinding({cannotExecFn: () => {
                throw err;
            }});
            binding.setCommand(new StubCmd());

            binding.ifCannotExecuteCmd();

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifCannotExecute'", err);
        });
    });


    describe("when predicates", () => {
        test("whenStart returns false when no when is defined", () => {
            binding = createBinding();

            expect(binding.whenStartInvoke()).toBeFalsy();
        });

        test("when using an empty when array, the condition is true and logged when logging is on", () => {
            binding = createBinding({whenFn: [], loggers: ["binding"]});

            expect(binding.whenStartInvoke()).toBeTruthy();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Checking condition: true");
        });

        test("a non-strict predicate returning false does not throw and yields false", () => {
            const whenFn: Array<When<object, unknown>> = [{type: "nonStrict", fn: () => false}];
            binding = createBinding({whenFn});

            expect(binding.whenStartInvoke()).toBeFalsy();
            expect(logger.logBindingMsg).not.toHaveBeenCalled();
        });

        test("a strict predicate returning false throws CancelFSMError and logs the cancellation", () => {
            const whenFn: Array<When<object, unknown>> = [{type: "strict", fn: () => false}];
            binding = createBinding({whenFn, loggers: ["binding"]});

            expect(() => binding.whenStartInvoke()).toThrow(CancelFSMError);
            expect(logger.logBindingMsg).toHaveBeenCalledWith(`Cancelling interaction: ${interaction.constructor.name}`);
        });

        test("a strict predicate returning true does not throw and yields true", () => {
            const whenFn: Array<When<object, unknown>> = [{type: "strict", fn: () => true}];
            binding = createBinding({whenFn});

            expect(binding.whenStartInvoke()).toBeTruthy();
        });

        test("the when predicate receives the interaction data and accumulator", () => {
            const predicate = vi.fn((): boolean => true);
            const whenFn: Array<When<object, unknown>> = [
                {
                    type: "strictStart",
                    fn: predicate
                }
            ];
            binding = createBinding({whenFn, accInit: {foo: 1}});
            binding.accumulator = {foo: 1};

            binding.whenStartInvoke();

            expect(predicate).toHaveBeenCalledWith(interaction.data, binding.accumulator);
        });

        test("whenUpdate only considers predicates applying at 'then'", () => {
            const whenFn: Array<When<object, unknown>> = [
                {type: "then", fn: () => true},
                {type: "end", fn: () => false}
            ];
            binding = createBinding({whenFn});

            expect(binding.whenUpdateInvoke()).toBeTruthy();
        });

        test("whenStop only considers predicates applying at 'end'", () => {
            const whenFn: Array<When<object, unknown>> = [{type: "then", fn: () => false}];
            binding = createBinding({whenFn});

            expect(binding.whenStopInvoke()).toBeTruthy();
        });

        test("a strict 'end' predicate returning false is rejected at stop", () => {
            const whenFn: Array<When<object, unknown>> = [{type: "end", fn: () => false}];
            binding = createBinding({whenFn});

            expect(() => binding.whenStopInvoke()).toThrow(CancelFSMError);
        });

        test("an error thrown by the when predicate is caught and yields false", () => {
            const err = new Error("crash");
            const whenFn: Array<When<object, unknown>> = [
                {type: "nonStrict", fn: (): boolean => {
                    throw err;
                }}
            ];
            binding = createBinding({whenFn});

            expect(binding.whenStartInvoke()).toBeFalsy();
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in checking condition", err);
        });

        test("the condition is logged as false when logging is on and the predicate fails", () => {
            const whenFn: Array<When<object, unknown>> = [{type: "nonStrict", fn: () => false}];
            binding = createBinding({whenFn, loggers: ["binding"]});

            expect(binding.whenStartInvoke()).toBeFalsy();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Checking condition: false");
        });
    });

    describe("catch", () => {
        test("forwards the error to the onErr callback", () => {
            const onErrFn = vi.fn();
            binding = createBinding({onErrFn});

            binding.catch("boom");

            expect(onErrFn).toHaveBeenCalledWith("boom");
        });

        test("does nothing when no onErr callback is defined", () => {
            binding = createBinding();

            expect(() => binding.catch("boom")).not.toThrow();
        });

        test("reports an error thrown by the onErr callback", () => {
            const err = new Error("crash");
            binding = createBinding({onErrFn: () => {
                throw err;
            }});

            binding.catch("boom");

            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'catch'", err);
        });
    });

    describe("isWhenDefined", () => {
        test("returns false when no when is defined", () => {
            binding = createBinding();

            expect(binding.isWhenDefined()).toBeFalsy();
        });

        test("returns false when the when array is empty", () => {
            binding = createBinding({whenFn: []});

            expect(binding.isWhenDefined()).toBeFalsy();
        });

        test("returns true when at least one when predicate is defined", () => {
            binding = createBinding({whenFn: [{type: "nonStrict", fn: (): boolean => true}]});

            expect(binding.isWhenDefined()).toBeTruthy();
        });
    });
});

