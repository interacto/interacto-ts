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

import {BindingImpl, FSMImpl, LinearHistoryImpl, MustBeUndoableCmdError} from "../../src/interacto";
import {InteractionStub} from "../interaction/InteractionStub";
import {StubCmd, StubUndoableCmd} from "../command/StubCmd";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import {mock} from "vitest-mock-extended";
import type {FSMHandler, LinearHistoryBase, Logger, VisitorBinding} from "../../src/interacto";

/**
 * Flushes the pending micro/macro tasks so that the asynchronously resolved
 * promises handled by the binding have the time to run.
 * @returns A promise that resolves once the pending microtasks have run.
 */
const tick = async (): Promise<void> => {
    await new Promise<void>(resolve => {
        setTimeout(resolve, 0);
    });
};

/**
 * A concrete subclass exposing the protected members of BindingImpl that cannot be
 * reached otherwise (command setter and the `when*` predicates).
 */
class BindingImplStub extends BindingImpl<StubCmd, InteractionStub, unknown> {
    private whenStartValue: boolean | undefined;

    private whenUpdateValue: boolean | undefined;

    private whenStopValue: boolean | undefined;

    public constructor(continuous: boolean, interaction: InteractionStub, cmdProducer: () => StubCmd,
                       history: LinearHistoryBase, logger: Logger, name?: string, accInit?: unknown) {
        super(continuous, interaction, cmdProducer, [], history, logger, new Map(), name, accInit);
    }

    public setCommand(cmd: StubCmd | undefined): void {
        this._cmd = cmd;
    }

    public setWhenStart(value: boolean | undefined): void {
        this.whenStartValue = value;
    }

    public setWhenUpdate(value: boolean | undefined): void {
        this.whenUpdateValue = value;
    }

    public setWhenStop(value: boolean | undefined): void {
        this.whenStopValue = value;
    }

    protected override whenStart(): boolean {
        return this.whenStartValue ?? super.whenStart();
    }

    protected override whenUpdate(): boolean {
        return this.whenUpdateValue ?? super.whenUpdate();
    }

    protected override whenStop(): boolean {
        return this.whenStopValue ?? super.whenStop();
    }

    public fsmStartsInvoke(): void {
        super.fsmStarts();
    }

    public fsmUpdatesInvoke(): void {
        super.fsmUpdates();
    }

    public fsmStopsInvoke(): void {
        super.fsmStops();
    }

    public fsmErrorInvoke(err: unknown): void {
        super.fsmError(err);
    }

    public fsmCancelsInvoke(): void {
        super.fsmCancels();
    }
}

describe(BindingImpl, () => {
    let binding: BindingImplStub;
    let interaction: InteractionStub;
    let history: LinearHistoryImpl;
    let logger: Logger;

    interface BindingOpts {
        continuous?: boolean;
        cmdProducer?: () => StubCmd;
        name?: string;
        accInit?: unknown;
    }

    function createBinding(o: BindingOpts = {}): BindingImplStub {
        return new BindingImplStub(
            o.continuous ?? false,
            interaction,
            o.cmdProducer ?? ((): StubCmd => new StubCmd(true)),
            history,
            logger,
            o.name,
            o.accInit
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

    describe("constructor", () => {
        test("adds handlers to the interaction fsm", () => {
            const addHandler = vi.spyOn(interaction.fsm, "addHandler");
            binding = createBinding();
            expect(addHandler).toHaveBeenCalled();
        });

        test("notifies the added handlers with the fsm events", () => {
            const handlers: Array<FSMHandler> = [];
            vi.spyOn(interaction.fsm, "addHandler").mockImplementation(handler => {
                handlers.push(handler);
            });
            binding = createBinding();
            const handler = handlers.at(-1) as FSMHandler;
            expect(() => {
                handler.fsmStarts?.();
                handler.fsmUpdates?.();
                handler.fsmStops?.();
                handler.fsmCancels?.();
                handler.fsmError?.(new Error("e"));
            }).not.toThrow();
        });

        test("registers the binding to the provided widgets", () => {
            const register = vi.spyOn(interaction, "registerToNodes");
            binding = createBinding();
            expect(register).toHaveBeenCalledWith([]);
        });

        test("disables the logging by default", () => {
            binding = createBinding();
            expect(binding.logBinding).toBeFalsy();
            expect(binding.logCmd).toBeFalsy();
            expect(binding.logUsage).toBeFalsy();
        });

        test("initialises the accumulator from accInit", () => {
            binding = createBinding({accInit: {a: 1}});
            expect(binding.accumulator).toStrictEqual({a: 1});
        });

        test("starts with an empty accumulator when no accInit is provided", () => {
            binding = createBinding();
            expect(binding.accumulator).toStrictEqual({});
        });
    });

    describe("getters", () => {
        test("computes the default name from the interaction class name", () => {
            binding = createBinding();
            expect(binding.name).toBe(InteractionStub.name);
        });

        test("returns the name given in the constructor", () => {
            binding = createBinding({name: "foo"});
            expect(binding.name).toBe("foo");
        });

        test("returns the interaction", () => {
            binding = createBinding();
            expect(binding.interaction).toBe(interaction);
        });

        test("returns the current command or undefined", () => {
            binding = createBinding();
            expect(binding.command).toBeUndefined();
            const cmd = new StubCmd();
            binding.setCommand(cmd);
            expect(binding.command).toBe(cmd);
        });

        test("returns whether the interaction is running", () => {
            binding = createBinding();
            expect(binding.running).toBeFalsy();
        });

        test("tracks the number of ended and cancelled interactions", () => {
            binding = createBinding();
            expect(binding.timesEnded).toBe(0);
            expect(binding.timesCancelled).toBe(0);
        });
    });

    test("is never when-defined", () => {
        binding = createBinding();
        expect(binding.isWhenDefined()).toBeFalsy();
    });

    test("clears the interaction events", () => {
        binding = createBinding();
        const reinit = vi.spyOn(interaction, "fullReinit");
        binding.clearEvents();
        expect(reinit).toHaveBeenCalledWith();
    });


    describe("overridable no-op methods", () => {
        test("can be invoked without side effects", () => {
            binding = createBinding();
            const cmd = new StubCmd();
            binding.setCommand(cmd);
            expect(() => {
                binding.catch(new Error("e"));
                binding.first();
                binding.then();
                binding.end();
                binding.cancel();
                binding.endOrCancel();
                binding.ifCmdHadNoEffect();
                binding.ifCmdHadEffects();
                binding.ifCannotExecuteCmd();
            }).not.toThrow();
            expect(binding.command).toBe(cmd);
        });
    });

    describe("activated setter", () => {
        test("logs and activates when enabling", () => {
            binding = createBinding();
            binding.logBinding = true;
            binding.activated = true;
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Binding Activated: true");
            expect(binding.activated).toBeTruthy();
        });

        test("deactivates without flushing when no command is present", () => {
            binding = createBinding();
            binding.activated = false;
            expect(binding.activated).toBeFalsy();
        });

        test("flushes the unset command when deactivating", () => {
            binding = createBinding();
            const cmd = new StubCmd();
            const flush = vi.spyOn(cmd, "flush");
            binding.setCommand(cmd);
            binding.activated = false;
            expect(flush).toHaveBeenCalledWith();
            expect(binding.command).toBeUndefined();
        });
    });

    describe("fsmError", () => {
        test("logs the binding error when logBinding is on", () => {
            binding = createBinding();
            binding.logBinding = true;
            const error = new Error("err");
            binding.fsmErrorInvoke(error);
            expect(logger.logBindingErr).toHaveBeenCalledWith("", error);
        });

        test("does not log when logBinding is off", () => {
            binding = createBinding();
            binding.fsmErrorInvoke(new Error("err"));
            expect(logger.logBindingErr).not.toHaveBeenCalled();
        });
    });


    describe("fsmCancels", () => {
        test("reinitialises the accumulator when no command is present", () => {
            binding = createBinding({accInit: {a: 1}});
            binding.accumulator = {a: 2};
            binding.fsmCancelsInvoke();
            expect(binding.accumulator).toStrictEqual({a: 1});
        });

        test("cancels the current command and finalises it", () => {
            binding = createBinding();
            const cmd = new StubCmd();
            const cancel = vi.spyOn(cmd, "cancel");
            binding.setCommand(cmd);
            binding.fsmCancelsInvoke();
            expect(cancel).toHaveBeenCalledWith();
            expect(binding.command).toBeUndefined();
            expect(binding.timesCancelled).toBe(1);
        });

        test("logs the cancellation messages when logging is on", () => {
            binding = createBinding();
            binding.logBinding = true;
            binding.logCmd = true;
            binding.setCommand(new StubCmd());
            binding.fsmCancelsInvoke();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Binding cancelled");
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Cancelling command", "StubCmd");
        });

        test("logs the binding end with cancelled set to true when logUsage is on", () => {
            binding = createBinding();
            binding.logUsage = true;
            binding.setCommand(new StubCmd());
            binding.fsmCancelsInvoke();
            expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub", true);
        });

        test("undoes the continuous undoable command when cancelling", () => {
            binding = createBinding({continuous: true});
            binding.logCmd = true;
            const cmd = new StubUndoableCmd();
            const undo = vi.spyOn(cmd, "undo");
            binding.setCommand(cmd);
            binding.fsmCancelsInvoke();
            expect(undo).toHaveBeenCalledWith();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command undone", "StubUndoableCmd");
            expect(binding.timesCancelled).toBe(1);
        });

        test("throws when the continuous command is not undoable", () => {
            binding = createBinding({continuous: true});
            binding.setCommand(new StubCmd());
            expect(() => binding.fsmCancelsInvoke()).toThrow(MustBeUndoableCmdError);
        });
    });


    describe("fsmStarts", () => {
        test("does nothing when deactivated", () => {
            binding = createBinding();
            binding.setWhenStart(false);
            binding.activated = false;
            binding.fsmStartsInvoke();
            expect(binding.command).toBeUndefined();
        });

        test("creates and initialises the command", () => {
            const cmd = new StubCmd(true);
            binding = createBinding({cmdProducer: () => cmd});
            binding.fsmStartsInvoke();
            expect(binding.command).toBe(cmd);
        });

        test("calls first on the created command", () => {
            binding = createBinding();
            const first = vi.spyOn(binding, "first");
            binding.fsmStartsInvoke();
            expect(first).toHaveBeenCalledWith();
        });

        test("logs the starting message when logBinding is on", () => {
            binding = createBinding();
            binding.logBinding = true;
            binding.fsmStartsInvoke();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Starting binding: true");
        });

        test("logs the command creation when logCmd is on", () => {
            binding = createBinding();
            binding.logCmd = true;
            binding.fsmStartsInvoke();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command created and init", "StubCmd");
        });

        test("logs the binding start when logUsage is on", () => {
            binding = createBinding();
            binding.logUsage = true;
            binding.fsmStartsInvoke();
            expect(logger.logBindingStart).toHaveBeenCalledWith("InteractionStub:StubCmd");
        });

        test("does not create a command when whenStart returns false", () => {
            binding = createBinding();
            binding.setWhenStart(false);
            const first = vi.spyOn(binding, "first");
            binding.fsmStartsInvoke();
            expect(binding.command).toBeUndefined();
            expect(first).not.toHaveBeenCalled();
        });

        test("handles a throwing command producer", () => {
            const error = new Error("boom");
            binding = createBinding({cmdProducer: () => {
                throw error;
            }});
            binding.fsmStartsInvoke();
            expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", error);
            expect(binding.command).toBeUndefined();
        });

        test("handles a producer returning undefined", () => {
            binding = createBinding({cmdProducer: () => undefined as unknown as StubCmd});
            const first = vi.spyOn(binding, "first");
            binding.fsmStartsInvoke();
            expect(binding.command).toBeUndefined();
            expect(first).not.toHaveBeenCalled();
        });
    });


    describe("fsmUpdates", () => {
        test("does nothing when deactivated", () => {
            binding = createBinding();
            binding.activated = false;
            binding.fsmUpdatesInvoke();
            expect(binding.command).toBeUndefined();
        });

        test("logs the update when logBinding is on", () => {
            binding = createBinding();
            binding.logBinding = true;
            binding.fsmUpdatesInvoke();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Binding updates");
        });

        test("does nothing when whenUpdate returns false", () => {
            binding = createBinding();
            binding.setWhenUpdate(false);
            const then = vi.spyOn(binding, "then");
            binding.fsmUpdatesInvoke();
            expect(binding.command).toBeUndefined();
            expect(then).not.toHaveBeenCalled();
        });

        test("creates and updates the command (non-continuous)", () => {
            const cmd = new StubCmd(true);
            binding = createBinding({cmdProducer: () => cmd});
            const then = vi.spyOn(binding, "then");
            binding.fsmUpdatesInvoke();
            expect(binding.command).toBe(cmd);
            expect(then).toHaveBeenCalledWith();
        });

        test("does nothing when the produced command is undefined", () => {
            binding = createBinding({cmdProducer: () => undefined as unknown as StubCmd});
            const first = vi.spyOn(binding, "first");
            binding.fsmUpdatesInvoke();
            expect(binding.command).toBeUndefined();
            expect(first).not.toHaveBeenCalled();
        });

        test("does not re-create a command when one is already present", () => {
            const cmd = new StubCmd(true);
            binding = createBinding();
            binding.setCommand(cmd);
            const first = vi.spyOn(binding, "first");
            binding.fsmUpdatesInvoke();
            expect(binding.command).toBe(cmd);
            expect(first).not.toHaveBeenCalled();
        });

        test("logs the command update when logCmd is on", () => {
            binding = createBinding();
            binding.logCmd = true;
            binding.fsmUpdatesInvoke();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command update");
        });

        test("logs the when predicate in createAndInitCommand when logBinding is on", () => {
            binding = createBinding();
            binding.logBinding = true;
            binding.fsmUpdatesInvoke();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("when predicate is true");
        });

        test("logs the command creation in createAndInitCommand when logCmd is on", () => {
            binding = createBinding();
            binding.logCmd = true;
            binding.fsmUpdatesInvoke();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command creation");
        });
    });


    describe("continuous execution on update", () => {
        test("executes the command synchronously with a positive result", () => {
            const cmd = new StubCmd(true);
            binding = createBinding({continuous: true, cmdProducer: () => cmd});
            const ifCannot = vi.spyOn(binding, "ifCannotExecuteCmd");
            binding.fsmUpdatesInvoke();
            expect(ifCannot).not.toHaveBeenCalled();
        });

        test("cannot execute the command synchronously", () => {
            const cmd = new StubCmd(false);
            binding = createBinding({continuous: true, cmdProducer: () => cmd});
            const ifCannot = vi.spyOn(binding, "ifCannotExecuteCmd");
            binding.fsmUpdatesInvoke();
            expect(ifCannot).toHaveBeenCalledWith();
        });

        test("logs the continuous sync result when logCmd is on", () => {
            const cmd = new StubCmd(false);
            binding = createBinding({
                continuous: true,
                cmdProducer: () => cmd
            });
            binding.logCmd = true;
            binding.fsmUpdatesInvoke();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Continuous command execution had this result: false");
        });

        test("executes an asynchronous command successfully", async () => {
            const cmd = mock<StubCmd>();
            cmd.execute.mockResolvedValue(true);
            binding = createBinding({continuous: true, cmdProducer: () => cmd});
            const ifCannot = vi.spyOn(binding, "ifCannotExecuteCmd");
            binding.fsmUpdatesInvoke();
            await tick();
            expect(ifCannot).not.toHaveBeenCalled();
        });

        test("cannot execute the command asynchronously", async () => {
            const cmd = mock<StubCmd>();
            cmd.execute.mockResolvedValue(false);
            binding = createBinding({continuous: true, cmdProducer: () => cmd});
            const ifCannot = vi.spyOn(binding, "ifCannotExecuteCmd");
            binding.fsmUpdatesInvoke();
            await tick();
            expect(ifCannot).toHaveBeenCalledWith();
        });

        test("logs an error when the asynchronous command rejects", async () => {
            const cmd = mock<StubCmd>();
            cmd.execute.mockRejectedValue(new Error("rejected"));
            binding = createBinding({continuous: true, cmdProducer: () => cmd});
            binding.fsmUpdatesInvoke();
            await tick();
            expect(logger.logCmdErr).toHaveBeenCalledWith(
                "Error while executing the command continuously",
                expect.any(Error)
            );
        });

        test("logs the async execution result when logCmd is on", async () => {
            const cmd = mock<StubCmd>();
            cmd.execute.mockResolvedValue(true);
            binding = createBinding({
                continuous: true,
                cmdProducer: () => cmd
            });
            binding.logCmd = true;
            binding.fsmUpdatesInvoke();
            await tick();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Continuous command execution had this result: true");
        });
    });


    describe("fsmStops", () => {
        test("does nothing when deactivated", () => {
            binding = createBinding();
            binding.activated = false;
            binding.fsmStopsInvoke();
            expect(binding.command).toBeUndefined();
        });

        test("logs the stop when logBinding is on", () => {
            binding = createBinding();
            binding.logBinding = true;
            binding.fsmStopsInvoke();
            expect(logger.logBindingMsg).toHaveBeenCalledWith("Binding stops");
        });

        test("does nothing when stop does not produce a command and none is ongoing", () => {
            binding = createBinding();
            binding.setWhenStop(false);
            binding.fsmStopsInvoke();
            expect(binding.command).toBeUndefined();
            expect(binding.timesCancelled).toBe(0);
        });

        test("cancels the ongoing command when stop does not produce a new one", () => {
            binding = createBinding();
            binding.setWhenStop(false);
            const cmd = new StubCmd();
            const cancel = vi.spyOn(cmd, "cancel");
            binding.setCommand(cmd);
            binding.fsmStopsInvoke();
            expect(cancel).toHaveBeenCalledWith();
            expect(binding.command).toBeUndefined();
            expect(binding.timesCancelled).toBe(1);
        });

        test("logs the stop with cancelled set to true via logUsage", () => {
            binding = createBinding();
            binding.logUsage = true;
            binding.setWhenStop(false);
            binding.setCommand(new StubCmd());
            binding.fsmStopsInvoke();
            expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub", true);
        });

        test("logs the command cancel when logCmd is on", () => {
            binding = createBinding();
            binding.logCmd = true;
            binding.setWhenStop(false);
            binding.setCommand(new StubCmd());
            binding.fsmStopsInvoke();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Cancelling the command");
        });

        test("undoes the continuous undoable command when stopping", () => {
            binding = createBinding({continuous: true});
            binding.setWhenStop(false);
            const cmd = new StubUndoableCmd();
            const undo = vi.spyOn(cmd, "undo");
            binding.setCommand(cmd);
            binding.fsmStopsInvoke();
            expect(undo).toHaveBeenCalledWith();
            expect(binding.timesCancelled).toBe(1);
        });

        test("throws when the continuous command to cancel is not undoable", () => {
            binding = createBinding({continuous: true});
            binding.setWhenStop(false);
            binding.setCommand(new StubCmd());
            expect(() => binding.fsmStopsInvoke()).toThrow(MustBeUndoableCmdError);
        });

        test("executes the created continuous command on stop without calling then", () => {
            binding = createBinding({continuous: true});
            const then = vi.spyOn(binding, "then");
            binding.fsmStopsInvoke();
            expect(then).not.toHaveBeenCalled();
            expect(binding.timesEnded).toBe(1);
            expect(binding.command).toBeUndefined();
        });
    });


    describe("executing a command on stop", () => {
        test("executes the command and produces it (sync, undoable, with effects)", () => {
            const cmd = new StubUndoableCmd(true, true);
            binding = createBinding({cmdProducer: () => cmd});
            const ifEffects = vi.spyOn(binding, "ifCmdHadEffects");
            const produced: Array<StubCmd> = [];
            const sub = binding.produces.subscribe(c => {
                produced.push(c);
            });
            binding.fsmStopsInvoke();
            expect(binding.timesEnded).toBe(1);
            expect(binding.command).toBeUndefined();
            expect(ifEffects).toHaveBeenCalledWith();
            expect(produced).toContain(cmd);
            sub.unsubscribe();
        });

        test("executes the command with effects but without history when not undoable", () => {
            const cmd = new StubCmd(true, true);
            binding = createBinding({cmdProducer: () => cmd});
            const ifEffects = vi.spyOn(binding, "ifCmdHadEffects");
            binding.fsmStopsInvoke();
            expect(ifEffects).toHaveBeenCalledWith();
            expect(binding.timesEnded).toBe(1);
        });

        test("executes a command without effect", () => {
            const cmd = new StubCmd(true, false);
            binding = createBinding({cmdProducer: () => cmd});
            const ifNoEffect = vi.spyOn(binding, "ifCmdHadNoEffect");
            binding.fsmStopsInvoke();
            expect(ifNoEffect).toHaveBeenCalledWith();
            expect(binding.timesEnded).toBe(1);
        });

        test("cannot execute the command", () => {
            const cmd = new StubCmd(false);
            binding = createBinding({cmdProducer: () => cmd});
            const ifCannot = vi.spyOn(binding, "ifCannotExecuteCmd");
            binding.fsmStopsInvoke();
            expect(ifCannot).toHaveBeenCalledWith();
            expect(binding.timesEnded).toBe(1);
            expect(binding.command).toBeUndefined();
        });

        test("executes an asynchronous command successfully", async () => {
            const cmd = mock<StubCmd>();
            cmd.execute.mockResolvedValue(true);
            binding = createBinding({cmdProducer: () => cmd});
            binding.fsmStopsInvoke();
            await tick();
            expect(binding.timesEnded).toBe(1);
            expect(binding.command).toBeUndefined();
        });

        test("logs an error when the asynchronous command rejects on stop", async () => {
            const cmd = mock<StubCmd>();
            cmd.execute.mockRejectedValue(new Error("rejected"));
            binding = createBinding({cmdProducer: () => cmd});
            binding.fsmStopsInvoke();
            await tick();
            expect(logger.logCmdErr).toHaveBeenCalledWith("Error while executing the command", expect.any(Error));
            expect(binding.timesEnded).toBe(1);
        });

        test("logs the command update and result when logCmd is on", () => {
            binding = createBinding();
            binding.logCmd = true;
            binding.fsmStopsInvoke();
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command updated");
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command execution had this result: true");
            expect(logger.logCmdMsg).toHaveBeenCalledWith("Command execution had effect: true");
        });
    });

    test("accepts a visitor", () => {
        binding = createBinding();
        const visitor = mock<VisitorBinding>();
        binding.acceptVisitor(visitor);
        expect(visitor.visitBinding).toHaveBeenCalledWith(binding);
    });

    test("uninstalls the binding and completes the produced commands", () => {
        binding = createBinding();
        const uninstall = vi.spyOn(interaction, "uninstall");
        let completed = false;
        binding.produces.subscribe({
            complete: () => {
                completed = true;
            }
        });
        binding.uninstallBinding();
        expect(uninstall).toHaveBeenCalledWith();
        expect(binding.activated).toBeFalsy();
        expect(binding.logBinding).toBeFalsy();
        expect(binding.logCmd).toBeFalsy();
        expect(binding.logUsage).toBeFalsy();
        expect(completed).toBeTruthy();
    });
});

