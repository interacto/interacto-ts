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

import { WidgetBindingImpl, InteractionData, CommandsRegistry, CancelFSMException, FSM, ErrorCatcher } from "../../src";
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

let binding: WidgetBindingStub;
let errorStream: Subscription;

beforeEach(() => {
    binding = new WidgetBindingStub(false, () => new StubCmd(), new InteractionStub(new FSM()));
    binding.setActivated(true);
    errorStream = ErrorCatcher.getInstance().getErrors().subscribe((_err: Error) => fail());
});

afterEach(() => {
    CommandsRegistry.getInstance().clear();
    errorStream.unsubscribe();
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
    const errors: Array<Error> = [];
    const ex = new Error();
    errorStream = ErrorCatcher.getInstance().getErrors().subscribe(err => errors.push(err));
    const supplier = (): StubCmd => {
        throw ex;
    };

    binding = new WidgetBindingStub(true, supplier, new InteractionStub(new FSM()));
    binding.conditionRespected = true;
    jest.spyOn(binding, "first");
    binding.fsmStarts();
    expect(binding.getCommand()).toBeUndefined();
    expect(errors).toHaveLength(1);
    expect(ex).toBe(errors[0]);
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
