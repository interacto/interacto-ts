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

import { Subject } from "rxjs";
import { FSM } from "../../src/fsm/FSM";
import { InitState } from "../../src/fsm/InitState";
import { OutputState } from "../../src/fsm/OutputState";
import { StdState } from "../../src/fsm/StdState";
import { InteractionStub } from "./InteractionStub";

let interaction: InteractionStub;
let fsm: FSM;
let currentStateObs: Subject<[OutputState, OutputState]>;
let currentState: OutputState;

beforeEach(() => {
    currentStateObs = new Subject();
    fsm = {} as FSM;
    fsm.fullReinit = jest.fn();
    fsm.currentStateObservable = jest.fn(() => currentStateObs);
    fsm.getCurrentState = jest.fn(() => currentState);
    interaction = new InteractionStub(fsm);
});

afterEach(() => {
    jest.clearAllMocks();
    interaction.uninstall();
});


test("full reinit", () => {
    interaction.fullReinit();
    expect(fsm.fullReinit).toHaveBeenCalledTimes(1);
});

test("is running not activated", () => {
    interaction.setActivated(false);
    expect(interaction.isRunning()).toBeFalsy();
});

test("is running init state", () => {
    interaction.setActivated(true);
    currentState = new InitState(fsm, "s");
    expect(interaction.isRunning()).toBeFalsy();
});

test("is running OK", () => {
    interaction.setActivated(true);
    currentState = new StdState(fsm, "s");
    expect(interaction.isRunning()).toBeTruthy();
});

test("activated by default", () => {
    expect(interaction.isActivated()).toBeTruthy();
});

test("set not activated", () => {
    interaction.setActivated(false);
    expect(interaction.isActivated()).toBeFalsy();
});

test("set reactivated", () => {
    interaction.setActivated(false);
    interaction.setActivated(true);
    expect(interaction.isActivated()).toBeTruthy();
});

test("not process when not activated", () => {
    const evt = {} as Event;
    interaction.setActivated(false);
    fsm.process = jest.fn();
    interaction.processEvent(evt);
    expect(fsm.process).not.toHaveBeenCalledWith();
});

test("getFSM", () => {
    expect(interaction.getFsm()).toBe(fsm);
});

test("reinit", () => {
    fsm.reinit = jest.fn();
    jest.spyOn(interaction, "reinitData");
    interaction.reinit();
    expect(interaction.reinitData).toHaveBeenCalledTimes(1);
    expect(fsm.reinit).toHaveBeenCalledTimes(1);
});

test("uninstall", () => {
    jest.spyOn(interaction, "updateEventsRegistered");
    interaction.uninstall();
    currentStateObs.next([{} as OutputState, {} as OutputState]);
    expect(interaction.isActivated()).toBeFalsy();
    expect(interaction.updateEventsRegistered).not.toHaveBeenCalledWith();
});

test("currentState", () => {
    const s1 = {} as OutputState;
    const s2 = {} as OutputState;
    jest.spyOn(interaction, "updateEventsRegistered");
    currentStateObs.next([s1, s2]);
    expect(interaction.updateEventsRegistered).toHaveBeenCalledWith(s1, s2);
});

