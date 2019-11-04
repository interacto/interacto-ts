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
    errorStream = ErrorCatcher.getInstance().getErrors().subscribe((err: Error) => fail());
});

afterEach(() => {
    CommandsRegistry.getInstance().clear();
    errorStream.unsubscribe();
}

);

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

test("testInteractionStartsThrowMustCancelStateMachineException", () => {
	binding.mustCancel = true;
	expect(() => binding.fsmStarts()).toThrow(CancelFSMException);
});

test("testInteractionStartsOk", () => {
	binding.conditionRespected = true;
	binding.fsmStarts();
	expect(binding.getCommand()).not.toBeUndefined();
});
