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

import { WidgetBindingImpl, InteractionData, CommandsRegistry, CancelFSMException, FSM, ErrorCatcher,
    CmdStatus, MustBeUndoableCmdException, Undoable, RegistrationPolicy } from "../../src";
import { InteractionStub } from "../interaction/InteractionStub";
import { StubCmd } from "../command/StubCmd";
import { Subscription } from "rxjs";

export class WidgetBindingStub extends WidgetBindingImpl<StubCmd, InteractionStub, InteractionData> {
    public conditionRespected: boolean;
    public mustCancel: boolean;


    public constructor(continuous: boolean, cmdCreation: (i?: InteractionData) => StubCmd, interaction: InteractionStub) {
        super(continuous, interaction, cmdCreation, []);
        this.conditionRespected = false;
        this.mustCancel = false;
    }

    public when(): boolean {
        return this.conditionRespected;
    }

    public isStrictStart(): boolean {
        return this.mustCancel;
    }
}

class CmdStubUndoable extends StubCmd implements Undoable {
    public hadEffect(): boolean {
        return true;
    }
    public canDo(): boolean {
        return true;
    }
    public undo(): void {
    }
    public redo(): void {
    }
    public getUndoName(): string {
        return "";
    }
}

let binding: WidgetBindingStub;
let errorStream: Subscription;
let errors: Array<Error>;

beforeEach(() => {
    binding = new WidgetBindingStub(false, () => new StubCmd(), new InteractionStub(new FSM()));
    binding.setActivated(true);
    errors = [];
    errorStream = ErrorCatcher.getInstance().getErrors().subscribe(err => errors.push(err));
});

afterEach(() => {
    CommandsRegistry.getInstance().clear();
    errorStream.unsubscribe();
    expect(errors).toHaveLength(0);
});

test("testLinkDeActivation", () => {
    binding.setActivated(true);
    binding.setActivated(false);
    expect(binding.isActivated()).toBeFalsy();
});

test("testLinkActivation", () => {
    binding.setActivated(false);
    binding.setActivated(true);
    expect(binding.isActivated()).toBeTruthy();
});

test("testExecuteNope", () => {
    expect(binding.isContinuousCmdExec()).toBeFalsy();
});

test("testExecuteOK", () => {
    binding = new WidgetBindingStub(true, () => new StubCmd(), new InteractionStub(new FSM()));
    expect(binding.isContinuousCmdExec()).toBeTruthy();
});

test("execute crash", () => {
    errorStream.unsubscribe();
    const ex = new Error();
    const errs: Array<Error> = [];
    errorStream = ErrorCatcher.getInstance().getErrors().subscribe(err => errs.push(err));
    const supplier = (): StubCmd => {
        throw ex;
    };

    binding = new WidgetBindingStub(true, supplier, new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    jest.spyOn(binding, "first");
    binding.fsmStarts();
    expect(binding.getCommand()).toBeUndefined();
    expect(errs).toHaveLength(1);
    expect(ex).toBe(errs[0]);
    expect(binding.first).not.toHaveBeenCalled();
});

test("execute crash and interaction stops", () => {
    errorStream.unsubscribe();
    const ex = new Error();
    const supplier = (): StubCmd => {
        throw ex;
    };

    binding = new WidgetBindingStub(true, supplier, new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    binding.fsmStops();
});

test("testIsInteractionMustBeCancelled", () => {
    expect(binding.isStrictStart()).toBeFalsy();
});

test("testNotRunning", () => {
    expect(binding.isRunning()).toBeFalsy();
});

test("testInteractionCancelsWhenNotStarted", () => {
    binding.fsmCancels();
});

test("testInteractionUpdatesWhenNotStarted", () => {
    binding.fsmUpdates();
});

test("testInteractionStopsWhenNotStarted", () => {
    binding.fsmStops();
});

test("testInteractionStartsWhenNoCorrectInteractionNotActivated", () => {
    binding.mustCancel = false;
    binding.setActivated(false);
    binding.fsmStarts();
    expect(binding.getCommand()).toBeUndefined();
});

test("testInteractionStartsWhenNoCorrectInteractionActivated", () => {
    binding.mustCancel = false;
    binding.conditionRespected = false;
    binding.fsmStarts();
    expect(binding.getCommand()).toBeUndefined();
});

test("interaction starts throw MustCancelStateMachineException", () => {
    binding.mustCancel = true;
    expect(() => binding.fsmStarts()).toThrow(CancelFSMException);
});

test("interaction starts throw MustCancelStateMachineException with log", () => {
    binding.mustCancel = true;
    binding.setLogBinding(true);
    expect(() => binding.fsmStarts()).toThrow(CancelFSMException);
});

test("testInteractionStartsOk", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    expect(binding.getCommand()).not.toBeUndefined();
});

test("testCounters", () => {
    expect(binding.getTimesEnded()).toStrictEqual(0);
    expect(binding.getTimesCancelled()).toStrictEqual(0);
});

test("testCounterEndedOnce", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.fsmStops();
    expect(binding.getTimesEnded()).toStrictEqual(1);
    expect(binding.getTimesCancelled()).toStrictEqual(0);
});

test("testCounterEndedTwice", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.fsmStops();
    binding.fsmStarts();
    binding.fsmStops();
    expect(binding.getTimesEnded()).toStrictEqual(2);
    expect(binding.getTimesCancelled()).toStrictEqual(0);
});

test("testCounterCancelledOnce", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.fsmCancels();
    expect(binding.getTimesCancelled()).toStrictEqual(1);
    expect(binding.getTimesEnded()).toStrictEqual(0);
});

test("testCounterCancelledTwice", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.fsmCancels();
    binding.fsmStarts();
    binding.fsmCancels();
    expect(binding.getTimesCancelled()).toStrictEqual(2);
    expect(binding.getTimesEnded()).toStrictEqual(0);
});

test("clear events", () => {
    jest.spyOn(binding.getInteraction(), "fullReinit");
    binding.clearEvents();
    expect(binding.getInteraction().fullReinit).toHaveBeenCalledTimes(1);
});

test("cancel interaction", () => {
    binding.conditionRespected = true;
    binding.setLogBinding(true);
    binding.setLogCmd(true);
    binding.fsmStarts();
    const cmd = binding.getCommand();
    jest.spyOn(binding, "cancel");
    jest.spyOn(binding, "endOrCancel");
    binding.fsmCancels();
    binding.fsmCancels();
    binding.fsmCancels();
    expect(cmd).not.toBeUndefined();
    expect(cmd?.getStatus()).toStrictEqual(CmdStatus.CANCELLED);
    expect(binding.endOrCancel).toHaveBeenCalledWith();
    expect(binding.cancel).toHaveBeenCalledTimes(1);
    expect(binding.getCommand()).toBeUndefined();
});

test("cancel interaction two times", () => {
    binding.conditionRespected = true;
    jest.spyOn(binding, "cancel");
    binding.fsmStarts();
    binding.fsmCancels();
    binding.fsmStarts();
    binding.fsmCancels();
    expect(binding.cancel).toHaveBeenCalledTimes(2);
});

test("cancel interaction continuous", () => {
    binding = new WidgetBindingStub(true, () => new StubCmd(), new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.getCommand()?.done();
    expect(() => binding.fsmCancels()).toThrow(MustBeUndoableCmdException);
});

test("cancel interaction continuous no effect", () => {
    binding = new WidgetBindingStub(true, () => new StubCmd(), new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    binding.fsmStarts();
    const cmd = binding.getCommand();
    binding.fsmCancels();
    expect(CmdStatus.CANCELLED).toStrictEqual(cmd?.getStatus());
});

test("cancel interaction continuous undoable", () => {
    const cmd = new CmdStubUndoable();
    jest.spyOn(cmd, "undo");
    binding = new WidgetBindingStub(true, () => cmd, new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    binding.setLogCmd(true);
    binding.fsmStarts();
    binding.fsmCancels();
    expect(cmd.undo).toHaveBeenCalledTimes(1);
});

test("cancel interaction continuous undoable no log", () => {
    const cmd = new CmdStubUndoable();
    jest.spyOn(cmd, "undo");
    binding = new WidgetBindingStub(true, () => cmd, new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.fsmCancels();
    expect(cmd.undo).toHaveBeenCalledTimes(1);
});

test("update activated with log cmd not ok", () => {
    jest.spyOn(binding, "then");
    binding.conditionRespected = false;
    binding.setLogBinding(true);
    binding.fsmStarts();
    binding.fsmUpdates();
    expect(binding.then).not.toHaveBeenCalledWith();
});

test("update activated no log cmd ok", () => {
    jest.spyOn(binding, "then");
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.fsmUpdates();
    expect(binding.then).toHaveBeenCalledWith();
});

test("update activated with log cmd ok", () => {
    jest.spyOn(binding, "then");
    binding.conditionRespected = true;
    binding.setLogCmd(true);
    binding.fsmStarts();
    binding.fsmUpdates();
    expect(binding.then).toHaveBeenCalledWith();
});

test("update not activated", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    jest.spyOn(binding, "first");
    jest.spyOn(binding, "then");
    binding.setActivated(false);
    binding.fsmUpdates();
    expect(binding.first).not.toHaveBeenCalledWith();
    expect(binding.then).not.toHaveBeenCalledWith();
});

test("update when cmd not created", () => {
    jest.spyOn(binding, "first");
    binding.conditionRespected = false;
    binding.fsmStarts();
    binding.setLogCmd(true);
    binding.conditionRespected = true;
    binding.fsmUpdates();
    expect(binding.first).toHaveBeenCalledWith();
    expect(binding.getCommand()).not.toBeUndefined();
});

test("update with cmd crash", () => {
    const ex = new Error();
    const supplier = (): StubCmd => {
        throw ex;
    };
    binding = new WidgetBindingStub(true, supplier, new InteractionStub(new FSM()));
    jest.spyOn(binding, "first");
    binding.conditionRespected = false;
    binding.fsmStarts();
    binding.conditionRespected = true;
    binding.fsmUpdates();
    errors.splice(errors.indexOf(ex), 1);
    expect(binding.first).not.toHaveBeenCalledWith();
    expect(binding.getCommand()).toBeUndefined();
});

test("update continuous with log cannotDo", () => {
    binding = new WidgetBindingStub(true, () => new StubCmd(), new InteractionStub(new FSM()));
    jest.spyOn(binding, "ifCannotExecuteCmd");
    binding.conditionRespected = true;
    binding.setLogCmd(true);
    binding.fsmStarts();
    (binding.getCommand() as StubCmd).candoValue = false;
    binding.fsmUpdates();
    expect(binding.ifCannotExecuteCmd).toHaveBeenCalledWith();
    expect(binding.getCommand()?.exec).toStrictEqual(0);
});

test("update continuous not log canDo", () => {
    binding = new WidgetBindingStub(true, () => new StubCmd(), new InteractionStub(new FSM()));
    jest.spyOn(binding, "ifCannotExecuteCmd");
    binding.conditionRespected = true;
    binding.fsmStarts();
    (binding.getCommand() as StubCmd).candoValue = true;
    binding.fsmUpdates();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
    expect(binding.getCommand()?.exec).toStrictEqual(1);
});

test("stop no log cmd created", () => {
    binding.conditionRespected = true;
    binding.fsmStarts();
    const cmd = binding.getCommand();
    binding.conditionRespected = false;
    binding.fsmStops();
    expect(cmd?.getStatus()).toStrictEqual(CmdStatus.CANCELLED);
    expect(binding.getCommand()).toBeUndefined();
    expect(binding.getTimesCancelled()).toStrictEqual(1);
});

test("stop no cmd created", () => {
    binding.conditionRespected = false;
    binding.fsmStarts();
    binding.fsmStops();
    expect(binding.getCommand()).toBeUndefined();
    expect(binding.getTimesCancelled()).toStrictEqual(0);
});

test("stop with log cmd created and cancelled two times", () => {
    binding.conditionRespected = true;
    binding.setLogCmd(true);
    binding.fsmStarts();
    binding.conditionRespected = false;
    binding.fsmStops();
    binding.conditionRespected = true;
    binding.fsmStarts();
    binding.conditionRespected = false;
    binding.fsmStops();
    expect(binding.getTimesCancelled()).toStrictEqual(2);
});

test("uninstall Binding", () => {
    binding.uninstallBinding();
    expect(binding.isActivated()).toBeFalsy();
});

test("after exec cmd had effects", () => {
    binding = new WidgetBindingStub(true, () => new CmdStubUndoable(), new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    jest.spyOn(binding, "ifCmdHadEffects");
    binding.fsmStarts();
    (binding.getCommand() as CmdStubUndoable).candoValue = true;
    binding.fsmStops();
    expect(CommandsRegistry.getInstance().getCommands()).toHaveLength(1);
    expect(CommandsRegistry.getInstance().getCommands()[0]).toBeInstanceOf(CmdStubUndoable);
    expect(binding.ifCmdHadEffects).toHaveBeenCalledWith();
});

test("after exec cmd had effects with none policy", () => {
    binding = new WidgetBindingStub(true, () => new class extends CmdStubUndoable {
        public getRegistrationPolicy(): RegistrationPolicy {
            return RegistrationPolicy.NONE;
        }
    }(), new InteractionStub(new FSM()));
    jest.spyOn(binding, "ifCmdHadEffects");
    binding.conditionRespected = true;
    binding.fsmStarts();
    (binding.getCommand() as CmdStubUndoable).candoValue = true;
    CommandsRegistry.getInstance().addCommand(binding.getCommand() as CmdStubUndoable);
    binding.fsmStops();
    expect(CommandsRegistry.getInstance().getCommands()).toHaveLength(0);
    expect(binding.ifCmdHadEffects).toHaveBeenCalledWith();
});
