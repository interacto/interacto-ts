/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import {BindingImpl, FSMImpl, MustBeUndoableCmdError, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd, StubUndoableCmd} from "../command/StubCmd";
import {InteractionStub} from "../interaction/InteractionStub";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {Logger} from "../../src/api/logging/Logger";
import type {InteractionData, Undoable, UndoHistory, VisitorBinding} from "../../src/interacto";

class BindingStub extends BindingImpl<StubCmd, InteractionStub, unknown> {
    public whenStartOK: boolean;

    public whenEndOK: boolean;

    public whenUpdateOK: boolean;

    public constructor(history: UndoHistory, logger: Logger, continuous: boolean,
                       cmdCreation: (i?: InteractionData) => StubCmd, interaction: InteractionStub) {
        super(continuous, interaction, cmdCreation, [], history, logger, new Map());
        this.whenStartOK = false;
        this.whenEndOK = false;
        this.whenUpdateOK = false;
    }

    protected override whenStart(): boolean {
        return this.whenStartOK;
    }

    protected override whenStop(): boolean {
        return this.whenEndOK;
    }

    protected override whenUpdate(): boolean {
        return this.whenUpdateOK;
    }
}

class CmdStubUndoable extends StubCmd implements Undoable {
    public override hadEffect(): boolean {
        return true;
    }

    public override canExecute(): boolean {
        return true;
    }

    public undo(): void {}

    public redo(): void {}

    public getUndoName(): string {
        return "";
    }

    public getVisualSnapshot(): SVGElement | string | undefined {
        return undefined;
    }

    public equals(_undoable: Undoable): boolean {
        return false;
    }
}

describe("using a binding", () => {
    let binding: BindingStub;
    let history: UndoHistory;
    let logger: Logger;

    beforeEach(() => {
        logger = mock<Logger>();
        history = new UndoHistoryImpl();
        binding = new BindingStub(history, logger, false, () => new StubCmd(), new InteractionStub(new FSMImpl(logger)));
        binding.activated = true;
    });

    afterEach(() => {
        history.clear();
        jest.clearAllMocks();
    });

    describe("nominal cases", () => {
        afterEach(() => {
            // eslint-disable-next-line jest/no-standalone-expect
            expect(logger.logInteractionErr).not.toHaveBeenCalled();
            // eslint-disable-next-line jest/no-standalone-expect
            expect(logger.logCmdErr).not.toHaveBeenCalled();
            // eslint-disable-next-line jest/no-standalone-expect
            expect(logger.logBindingErr).not.toHaveBeenCalled();
        });

        test("de activation", () => {
            binding.activated = true;
            binding.activated = false;
            expect(binding.activated).toBeFalsy();
        });

        test("link activation", () => {
            binding.activated = false;
            binding.activated = true;
            expect(binding.activated).toBeTruthy();
        });

        test("execute nope", () => {
            expect(binding.whenStartOK).toBeFalsy();
        });

        test("name is ok when not executed", () => {
            expect(binding.name).toBe("InteractionStub");
        });

        test("accept visitor works", () => {
            const visitor: VisitorBinding = mock<VisitorBinding>();
            binding.acceptVisitor(visitor);
            expect(visitor.visitBinding).toHaveBeenCalledTimes(1);
            expect(visitor.visitBinding).toHaveBeenCalledWith(binding);
        });

        test("execute Ok", () => {
            binding = new BindingStub(history, logger, true, () => new StubCmd(), new InteractionStub(new FSMImpl(logger)));
            expect(binding.continuousCmdExecution).toBeTruthy();
        });

        test("not running", () => {
            expect(binding.running).toBeFalsy();
        });

        test("interaction cancels when not started", () => {
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(binding.command).toBeUndefined();
        });

        test("interaction updates when not started", () => {
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            expect(binding.command).toBeUndefined();
        });

        test("interaction stops when not started", () => {
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(binding.command).toBeUndefined();
        });

        test("interaction starts when no correct interaction not activated", () => {
            binding.activated = false;
            binding.interaction.fsm.onStarting();
            expect(binding.command).toBeUndefined();
        });

        test("interaction starts when no correct interaction activated", () => {
            binding.interaction.fsm.onStarting();
            expect(binding.command).toBeUndefined();
        });

        test("interaction starts ok", () => {
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            expect(binding.command).toBeDefined();
        });

        test("counters", () => {
            expect(binding.timesEnded).toBe(0);
            expect(binding.timesCancelled).toBe(0);
        });

        test("counter ended once", () => {
            binding.whenStartOK = true;
            binding.whenEndOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onTerminating();
            expect(binding.timesEnded).toBe(1);
            expect(binding.timesCancelled).toBe(0);
        });

        test("counter ended twice", () => {
            binding.whenStartOK = true;
            binding.whenEndOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onTerminating();
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onTerminating();
            expect(binding.timesEnded).toBe(2);
            expect(binding.timesCancelled).toBe(0);
        });

        test("counter cancelled once", () => {
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(binding.timesCancelled).toBe(1);
            expect(binding.timesEnded).toBe(0);
        });

        test("counter cancelled twice", () => {
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(binding.timesCancelled).toBe(2);
            expect(binding.timesEnded).toBe(0);
        });

        test("clear events", () => {
            jest.spyOn(binding.interaction, "fullReinit");
            binding.clearEvents();
            expect(binding.interaction.fullReinit).toHaveBeenCalledTimes(1);
        });

        test("cancel interaction", () => {
            binding.whenStartOK = true;
            binding.logBinding = true;
            binding.logCmd = true;
            binding.interaction.fsm.onStarting();
            const cmd = binding.command;
            jest.spyOn(binding, "cancel");
            jest.spyOn(binding, "endOrCancel");
            binding.interaction.fsm.onCancelling();
            binding.interaction.fsm.onCancelling();
            binding.interaction.fsm.onCancelling();
            expect(cmd).toBeDefined();
            expect(cmd?.getStatus()).toBe("cancelled");
            expect(binding.endOrCancel).toHaveBeenCalledWith();
            expect(binding.cancel).toHaveBeenCalledTimes(1);
            expect(binding.command).toBeUndefined();
        });

        test("cancel interaction two times", () => {
            binding.whenStartOK = true;
            jest.spyOn(binding, "cancel");
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(binding.cancel).toHaveBeenCalledTimes(2);
        });

        test("cancel interaction continuous not undoable", () => {
            binding = new BindingStub(history, logger, true, () => new StubCmd(), new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "cancel");
            jest.spyOn(binding, "endOrCancel");
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            // eslint-disable-next-line no-unused-expressions
            binding.command?.done();
            expect(() => {
                binding.interaction.fsm.onCancelling();
            }).toThrow(MustBeUndoableCmdError);
            expect(binding.timesEnded).toBe(0);
            expect(binding.timesCancelled).toBe(1);
            expect(binding.cancel).toHaveBeenCalledTimes(1);
            expect(binding.endOrCancel).toHaveBeenCalledTimes(1);
            expect(binding.command).toBeUndefined();
        });

        test("cancel interaction continuous undoable", () => {
            const cmd = new CmdStubUndoable();
            jest.spyOn(cmd, "undo");
            jest.spyOn(cmd, "cancel");
            binding = new BindingStub(history, logger, true, () => cmd, new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "cancel");
            jest.spyOn(binding, "endOrCancel");
            binding.whenStartOK = true;
            binding.logCmd = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(cmd.undo).toHaveBeenCalledTimes(1);
            expect(cmd.cancel).toHaveBeenCalledTimes(1);
            expect(binding.cancel).toHaveBeenCalledTimes(1);
            expect(binding.endOrCancel).toHaveBeenCalledTimes(1);
        });

        test("name contains the command name on execution", () => {
            const cmd = new CmdStubUndoable();
            jest.spyOn(cmd, "undo");
            binding = new BindingStub(history, logger, true, () => cmd, new InteractionStub(new FSMImpl(logger)));
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            expect(binding.name).toBe("InteractionStub:CmdStubUndoable");
        });

        test("cancel interaction continuous undoable no log", () => {
            const cmd = new CmdStubUndoable();
            jest.spyOn(cmd, "undo");
            binding = new BindingStub(history, logger, true, () => cmd, new InteractionStub(new FSMImpl(logger)));
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(cmd.undo).toHaveBeenCalledTimes(1);
        });

        test("update activated with log cmd not ok", () => {
            jest.spyOn(binding, "then");
            binding.whenStartOK = false;
            binding.logBinding = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            expect(binding.then).not.toHaveBeenCalledWith();
        });

        test("update activated no log cmd ok", () => {
            jest.spyOn(binding, "then");
            binding.whenStartOK = true;
            binding.whenUpdateOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            expect(binding.then).toHaveBeenCalledWith();
        });

        test("update activated with log cmd ok", () => {
            jest.spyOn(binding, "then");
            binding.whenStartOK = true;
            binding.whenUpdateOK = true;
            binding.logCmd = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            expect(binding.then).toHaveBeenCalledWith();
        });

        test("update not activated", () => {
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            jest.spyOn(binding, "first");
            jest.spyOn(binding, "then");
            binding.activated = false;
            binding.interaction.fsm.onUpdating();
            expect(binding.first).not.toHaveBeenCalledWith();
            expect(binding.then).not.toHaveBeenCalledWith();
        });

        test("update when cmd not created", () => {
            jest.spyOn(binding, "first");
            binding.whenStartOK = false;
            binding.whenUpdateOK = true;
            binding.interaction.fsm.onStarting();
            binding.logCmd = true;
            binding.interaction.fsm.onUpdating();
            expect(binding.first).toHaveBeenCalledWith();
            expect(binding.command).toBeDefined();
        });

        test("update continuous with log cannotDo", () => {
            binding = new BindingStub(history, logger, true, () => {
                const cmd = new StubCmd();
                jest.spyOn(cmd, "execute");
                return cmd;
            }, new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "ifCannotExecuteCmd");
            binding.whenStartOK = true;
            binding.whenUpdateOK = true;
            binding.logCmd = true;
            binding.interaction.fsm.onStarting();
            (binding.command as StubCmd).candoValue = false;
            binding.interaction.fsm.onUpdating();
            expect(binding.ifCannotExecuteCmd).toHaveBeenCalledWith();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(binding.command!.execute).toHaveBeenCalledTimes(1);
        });

        test("update continuous not log canDo", () => {
            binding = new BindingStub(history, logger, true, () => {
                const cmd = new StubCmd();
                jest.spyOn(cmd, "execute");
                return cmd;
            }, new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "ifCannotExecuteCmd");
            binding.whenStartOK = true;
            binding.whenUpdateOK = true;
            binding.interaction.fsm.onStarting();
            (binding.command as StubCmd).candoValue = true;
            binding.interaction.fsm.onUpdating();
            expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(binding.command!.execute).toHaveBeenCalledTimes(1);
        });

        test("stop no log cmd created", () => {
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            const cmd = binding.command;
            binding.whenStartOK = false;
            binding.interaction.fsm.onCancelling();
            expect(cmd?.getStatus()).toBe("cancelled");
            expect(binding.command).toBeUndefined();
            expect(binding.timesCancelled).toBe(1);
        });

        test("stop no cmd created", () => {
            binding.whenStartOK = false;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(binding.command).toBeUndefined();
            expect(binding.timesCancelled).toBe(0);
        });

        test("stop with log cmd created and cancelled two times", () => {
            binding.whenStartOK = true;
            binding.logCmd = true;
            binding.interaction.fsm.onStarting();
            binding.whenStartOK = false;
            binding.interaction.fsm.onCancelling();
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.whenStartOK = false;
            binding.interaction.fsm.onCancelling();
            expect(binding.timesCancelled).toBe(2);
            expect(logger.logBindingStart).not.toHaveBeenCalled();
            expect(logger.logBindingEnd).not.toHaveBeenCalled();
        });

        test("uninstall Binding", () => {
            jest.spyOn(binding.interaction, "uninstall");
            binding.uninstallBinding();
            expect(binding.activated).toBeFalsy();
            expect(binding.interaction.uninstall).toHaveBeenCalledTimes(1);
        });

        test("log usage when binding starts but not command", () => {
            binding.logUsage = true;
            binding.interaction.fsm.onStarting();
            expect(logger.logBindingStart).toHaveBeenCalledWith("InteractionStub");
        });

        test("log usage when binding ends but not command", () => {
            binding.logUsage = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onTerminating();
            expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub", false);
            expect(logger.logBindingStart).toHaveBeenCalledTimes(1);
        });

        test("log usage when binding cancels but not command", () => {
            binding.logUsage = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub", true);
            expect(logger.logBindingStart).toHaveBeenCalledTimes(1);
        });

        test("log usage when binding starts and with a command", () => {
            binding.whenStartOK = true;
            binding.logUsage = true;
            binding.interaction.fsm.onStarting();
            expect(logger.logBindingStart).toHaveBeenCalledWith("InteractionStub:StubCmd");
        });

        test("log usage when binding ends and with a command", () => {
            binding.whenStartOK = true;
            binding.whenEndOK = true;
            binding.logUsage = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            binding.interaction.fsm.onTerminating();
            expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub:StubCmd", false);
            expect(logger.logBindingStart).toHaveBeenCalledTimes(1);
        });

        test("log usage when binding cancels and with a command", () => {
            binding.whenStartOK = true;
            binding.whenEndOK = true;
            binding.whenUpdateOK = true;
            binding.logUsage = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onCancelling();
            expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub:StubCmd", true);
            expect(logger.logBindingStart).toHaveBeenCalledTimes(1);
        });

        test("with BindingImpl", () => {
            const b = new BindingImpl(false, new InteractionStub(new FSMImpl(logger)),
                () => new StubCmd(), [], history, logger, new Map());
            b.interaction.fsm.onStarting();
            b.interaction.fsm.onUpdating();
            b.interaction.fsm.onTerminating();
            expect(b.timesEnded).toBe(1);
            expect(b.timesCancelled).toBe(0);
        });
    });

    describe("crash in binding", () => {
        afterEach(() => {
            // eslint-disable-next-line jest/no-standalone-expect
            expect(logger.logInteractionErr).not.toHaveBeenCalled();
            // eslint-disable-next-line jest/no-standalone-expect
            expect(logger.logCmdErr).not.toHaveBeenCalled();
        });

        test("execute crash with an error", () => {
            const ex = new Error("err");
            const supplier = (): StubCmd => {
                throw ex;
            };

            binding = new BindingStub(history, logger, true, supplier, new InteractionStub(new FSMImpl(logger)));
            binding.whenStartOK = true;
            jest.spyOn(binding, "first");
            jest.spyOn(binding, "catch");
            binding.interaction.fsm.onStarting();
            expect(binding.command).toBeUndefined();
            expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", ex);
            expect(binding.first).not.toHaveBeenCalled();
            expect(binding.catch).toHaveBeenCalledWith(ex);
        });

        test("execute crash with not an error", () => {
            const supplier = (): StubCmd => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "yolo";
            };

            binding = new BindingStub(history, logger, true, supplier, new InteractionStub(new FSMImpl(logger)));
            binding.whenStartOK = true;
            jest.spyOn(binding, "first");
            binding.interaction.fsm.onStarting();
            expect(binding.command).toBeUndefined();
            expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", "yolo");
            expect(binding.first).not.toHaveBeenCalled();
        });

        test("execute crash and interaction stops", () => {
            const ex = new Error("err");
            const supplier = (): StubCmd => {
                throw ex;
            };

            binding = new BindingStub(history, logger, true, supplier, new InteractionStub(new FSMImpl(logger)));
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onTerminating();
            expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", ex);
            expect(binding.command).toBeUndefined();
        });

        test("update with cmd crash", () => {
            const ex = new Error("err");
            const supplier = (): StubCmd => {
                throw ex;
            };
            binding = new BindingStub(history, logger, true, supplier, new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "first");
            binding.whenStartOK = false;
            binding.whenUpdateOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", ex);
            expect(binding.first).not.toHaveBeenCalledWith();
            expect(binding.command).toBeUndefined();
        });

        test("command undone when 'when' is false on interaction end", () => {
            const cmd = new StubUndoableCmd(true);
            jest.spyOn(cmd, "undo");
            jest.spyOn(cmd, "cancel");
            binding = new BindingStub(history, logger, true, (): StubCmd => cmd, new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "cancel");
            jest.spyOn(binding, "endOrCancel");
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            binding.whenStartOK = false;
            binding.interaction.fsm.onTerminating();
            expect(binding.timesEnded).toBe(0);
            expect(binding.timesCancelled).toBe(1);
            expect(cmd.cancel).toHaveBeenCalledTimes(1);
            expect(cmd.undo).toHaveBeenCalledTimes(1);
            expect(binding.cancel).toHaveBeenCalledTimes(1);
            expect(binding.endOrCancel).toHaveBeenCalledTimes(1);
            expect(binding.command).toBeUndefined();
        });

        test("command not undoable when 'when' is false on interaction end", () => {
            const cmd = new StubCmd(true, true);
            jest.spyOn(cmd, "cancel");
            binding = new BindingStub(history, logger, true, (): StubCmd => cmd, new InteractionStub(new FSMImpl(logger)));
            jest.spyOn(binding, "cancel");
            jest.spyOn(binding, "endOrCancel");
            binding.whenStartOK = true;
            binding.interaction.fsm.onStarting();
            binding.interaction.fsm.onUpdating();
            binding.whenStartOK = false;
            expect(() => {
                binding.interaction.fsm.onTerminating();
            }).toThrow(MustBeUndoableCmdError);
            expect(binding.timesEnded).toBe(0);
            expect(binding.timesCancelled).toBe(1);
            expect(cmd.cancel).toHaveBeenCalledTimes(1);
            expect(binding.cancel).toHaveBeenCalledTimes(1);
            expect(binding.endOrCancel).toHaveBeenCalledTimes(1);
            expect(binding.command).toBeUndefined();
        });
    });
});
