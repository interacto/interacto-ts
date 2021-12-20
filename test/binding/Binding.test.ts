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

import type {InteractionData, Undoable, UndoHistory} from "../../src/interacto";
import {
    BindingImpl,
    CancelFSMException,
    CmdStatus,
    FSMImpl,
    MustBeUndoableCmdError,
    UndoHistoryImpl
} from "../../src/interacto";
import {StubCmd, StubUndoableCmd} from "../command/StubCmd";
import {InteractionStub} from "../interaction/InteractionStub";
import type {Logger} from "../../src/api/logging/Logger";
import {mock} from "jest-mock-extended";


class BindingStub extends BindingImpl<StubCmd, InteractionStub, InteractionData> {
    public conditionRespected: boolean;

    public constructor(history: UndoHistory, logger: Logger, continuous: boolean, strict: boolean,
                       cmdCreation: (i?: InteractionData) => StubCmd, interaction: InteractionStub) {
        super(continuous, strict, interaction, cmdCreation, [], history, logger);
        this.conditionRespected = false;
    }

    public override when(): boolean {
        return this.conditionRespected;
    }
}

class CmdStubUndoable extends StubCmd implements Undoable {
    public override hadEffect(): boolean {
        return true;
    }

    public override canExecute(): boolean {
        return true;
    }

    public undo(): void {
    }

    public redo(): void {
    }

    public getUndoName(): string {
        return "";
    }

    public getVisualSnapshot(): SVGElement | string | undefined {
        return undefined;
    }
}

let binding: BindingStub;
let history: UndoHistory;
let logger: Logger;

beforeEach(() => {
    logger = mock<Logger>();
    history = new UndoHistoryImpl();
    binding = new BindingStub(history, logger, false, false, () => new StubCmd(), new InteractionStub(new FSMImpl()));
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
        expect(binding.conditionRespected).toBeFalsy();
    });

    test("name is ok when not executed", () => {
        expect(binding.name).toBe("InteractionStub");
    });

    test("execute Ok", () => {
        binding = new BindingStub(history, logger, true, false, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        expect(binding.continuousCmdExecution).toBeTruthy();
    });

    test("is interaction must be cancelled", () => {
        expect(binding.strictStart).toBeFalsy();
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

    test("interactionStartsWhenNo correct interaction not activated", () => {
        binding.activated = false;
        binding.interaction.fsm.onStarting();
        expect(binding.command).toBeUndefined();
    });

    test("interactionStartsWhen no correct interaction activated", () => {
        binding.conditionRespected = false;
        binding.interaction.fsm.onStarting();
        expect(binding.command).toBeUndefined();
    });

    test("interaction starts throw MustCancelStateMachineException", () => {
        binding = new BindingStub(history, logger, true, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        expect(() => {
            binding.interaction.fsm.onStarting();
        }).toThrow(CancelFSMException);
    });

    test("interaction starts throw MustCancelStateMachineException with log", () => {
        binding = new BindingStub(history, logger, true, true, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        binding.logBinding = true;
        expect(() => {
            binding.interaction.fsm.onStarting();
        }).toThrow(CancelFSMException);
    });

    test("interaction starts ok", () => {
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        expect(binding.command).toBeDefined();
    });

    test("counters", () => {
        expect(binding.timesEnded).toBe(0);
        expect(binding.timesCancelled).toBe(0);
    });

    test("counter ended once", () => {
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onTerminating();
        expect(binding.timesEnded).toBe(1);
        expect(binding.timesCancelled).toBe(0);
    });

    test("counter ended twice", () => {
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onTerminating();
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onTerminating();
        expect(binding.timesEnded).toBe(2);
        expect(binding.timesCancelled).toBe(0);
    });

    test("counter cancelled once", () => {
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onCancelling();
        expect(binding.timesCancelled).toBe(1);
        expect(binding.timesEnded).toBe(0);
    });

    test("counter cancelled twice", () => {
        binding.conditionRespected = true;
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
        binding.conditionRespected = true;
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
        expect(cmd?.getStatus()).toStrictEqual(CmdStatus.cancelled);
        expect(binding.endOrCancel).toHaveBeenCalledWith();
        expect(binding.cancel).toHaveBeenCalledTimes(1);
        expect(binding.command).toBeUndefined();
    });

    test("cancel interaction two times", () => {
        binding.conditionRespected = true;
        jest.spyOn(binding, "cancel");
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onCancelling();
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onCancelling();
        expect(binding.cancel).toHaveBeenCalledTimes(2);
    });

    test("cancel interaction continuous", () => {
        binding = new BindingStub(history, logger, true, false, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        // eslint-disable-next-line no-unused-expressions
        binding.command?.done();
        expect(() => {
            binding.interaction.fsm.onCancelling();
        }).toThrow(MustBeUndoableCmdError);
    });

    test("cancel interaction continuous undoable", () => {
        const cmd = new CmdStubUndoable();
        jest.spyOn(cmd, "undo");
        jest.spyOn(cmd, "cancel");
        binding = new BindingStub(history, logger, true, false, () => cmd, new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "cancel");
        jest.spyOn(binding, "endOrCancel");
        binding.conditionRespected = true;
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
        binding = new BindingStub(history, logger, true, false, () => cmd, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        expect(binding.name).toBe("InteractionStub:CmdStubUndoable");
    });

    test("cancel interaction continuous undoable no log", () => {
        const cmd = new CmdStubUndoable();
        jest.spyOn(cmd, "undo");
        binding = new BindingStub(history, logger, true, false, () => cmd, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onCancelling();
        expect(cmd.undo).toHaveBeenCalledTimes(1);
    });

    test("update activated with log cmd not ok", () => {
        jest.spyOn(binding, "then");
        binding.conditionRespected = false;
        binding.logBinding = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onUpdating();
        expect(binding.then).not.toHaveBeenCalledWith();
    });

    test("update activated no log cmd ok", () => {
        jest.spyOn(binding, "then");
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onUpdating();
        expect(binding.then).toHaveBeenCalledWith();
    });

    test("update activated with log cmd ok", () => {
        jest.spyOn(binding, "then");
        binding.conditionRespected = true;
        binding.logCmd = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onUpdating();
        expect(binding.then).toHaveBeenCalledWith();
    });

    test("update not activated", () => {
        binding.conditionRespected = true;
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
        binding.conditionRespected = false;
        binding.interaction.fsm.onStarting();
        binding.logCmd = true;
        binding.conditionRespected = true;
        binding.interaction.fsm.onUpdating();
        expect(binding.first).toHaveBeenCalledWith();
        expect(binding.command).toBeDefined();
    });

    test("update continuous with log cannotDo", () => {
        binding = new BindingStub(history, logger, true, false, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "ifCannotExecuteCmd");
        binding.conditionRespected = true;
        binding.logCmd = true;
        binding.interaction.fsm.onStarting();
        (binding.command as StubCmd).candoValue = false;
        binding.interaction.fsm.onUpdating();
        expect(binding.ifCannotExecuteCmd).toHaveBeenCalledWith();
        expect(binding.command?.exec).toBe(0);
    });

    test("update continuous not log canDo", () => {
        binding = new BindingStub(history, logger, true, false, () => new StubCmd(), new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "ifCannotExecuteCmd");
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        (binding.command as StubCmd).candoValue = true;
        binding.interaction.fsm.onUpdating();
        expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
        expect(binding.command?.exec).toBe(1);
    });

    test("stop no log cmd created", () => {
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        const cmd = binding.command;
        binding.conditionRespected = false;
        binding.interaction.fsm.onCancelling();
        expect(cmd?.getStatus()).toStrictEqual(CmdStatus.cancelled);
        expect(binding.command).toBeUndefined();
        expect(binding.timesCancelled).toBe(1);
    });

    test("stop no cmd created", () => {
        binding.conditionRespected = false;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onCancelling();
        expect(binding.command).toBeUndefined();
        expect(binding.timesCancelled).toBe(0);
    });

    test("stop with log cmd created and cancelled two times", () => {
        binding.conditionRespected = true;
        binding.logCmd = true;
        binding.interaction.fsm.onStarting();
        binding.conditionRespected = false;
        binding.interaction.fsm.onCancelling();
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.conditionRespected = false;
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
        binding.conditionRespected = true;
        binding.logUsage = true;
        binding.interaction.fsm.onStarting();
        expect(logger.logBindingStart).toHaveBeenCalledWith("InteractionStub:StubCmd");
    });

    test("log usage when binding ends and with a command", () => {
        binding.conditionRespected = true;
        binding.logUsage = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onUpdating();
        binding.interaction.fsm.onTerminating();
        expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub:StubCmd", false);
        expect(logger.logBindingStart).toHaveBeenCalledTimes(1);
    });

    test("log usage when binding cancels and with a command", () => {
        binding.conditionRespected = true;
        binding.logUsage = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onCancelling();
        expect(logger.logBindingEnd).toHaveBeenCalledWith("InteractionStub:StubCmd", true);
        expect(logger.logBindingStart).toHaveBeenCalledTimes(1);
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
        const ex = new Error();
        const supplier = (): StubCmd => {
            throw ex;
        };

        binding = new BindingStub(history, logger, true, false, supplier, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
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

        binding = new BindingStub(history, logger, true, false, supplier, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        jest.spyOn(binding, "first");
        binding.interaction.fsm.onStarting();
        expect(binding.command).toBeUndefined();
        expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", "yolo");
        expect(binding.first).not.toHaveBeenCalled();
    });

    test("execute crash and interaction stops", () => {
        const ex = new Error();
        const supplier = (): StubCmd => {
            throw ex;
        };

        binding = new BindingStub(history, logger, true, false, supplier, new InteractionStub(new FSMImpl()));
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onTerminating();
        expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", ex);
        expect(binding.command).toBeUndefined();
    });

    test("update with cmd crash", () => {
        const ex = new Error();
        const supplier = (): StubCmd => {
            throw ex;
        };
        binding = new BindingStub(history, logger, true, false, supplier, new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "first");
        binding.conditionRespected = false;
        binding.interaction.fsm.onStarting();
        binding.conditionRespected = true;
        binding.interaction.fsm.onUpdating();
        expect(logger.logBindingErr).toHaveBeenCalledWith("Error while creating a command", ex);
        expect(binding.first).not.toHaveBeenCalledWith();
        expect(binding.command).toBeUndefined();
    });

    test("command undone when 'when' is false on interaction end", () => {
        const cmd = new StubUndoableCmd(true);
        jest.spyOn(cmd, "undo");
        jest.spyOn(cmd, "cancel");
        binding = new BindingStub(history, logger, true, false, (): StubCmd => cmd, new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "cancel");
        jest.spyOn(binding, "endOrCancel");
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onUpdating();
        binding.conditionRespected = false;
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
        binding = new BindingStub(history, logger, true, false, (): StubCmd => cmd, new InteractionStub(new FSMImpl()));
        jest.spyOn(binding, "cancel");
        jest.spyOn(binding, "endOrCancel");
        binding.conditionRespected = true;
        binding.interaction.fsm.onStarting();
        binding.interaction.fsm.onUpdating();
        binding.conditionRespected = false;
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
