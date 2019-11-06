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

import { StubEvent } from "./StubEvent";
import { CancellingState } from "../../src/fsm/CancellingState";
import { StdState } from "../../src/fsm/StdState";
import { TerminalState } from "../../src/fsm/TerminalState";
import { FSM } from "../../src/fsm/FSM";
import { StubTransitionOK } from "./StubTransitionOK";
import { FSMHandler } from "../../src/fsm/FSMHandler";
import { StubFSMHandler } from "./StubFSMHandler";
import { CancelFSMException } from "../../src/fsm/CancelFSMException";
import { OutputState } from "../../src";

jest.mock("./StubFSMHandler");

let fsm: FSM;
let std: StdState;
let terminal: TerminalState;
let cancelling: CancellingState;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSM();
    handler = new StubFSMHandler();
    fsm.addHandler(handler);
    fsm.log(true);
    std = new StdState(fsm, "s1");
    terminal = new TerminalState(fsm, "t1");
    cancelling = new CancellingState(fsm, "c1");
    new StubTransitionOK(fsm.initState, std);
    new StubTransitionOK(std, terminal);
    fsm.addState(std);
    fsm.addState(terminal);
    fsm.addState(cancelling);
});

test("testGetStates", () => {
    expect(fsm.getStates()).toEqual([fsm.initState, std, terminal, cancelling]);
});

test("testcurrentStateObservable", () => {
    expect(fsm.currentStateObservable()).not.toBeNull();
});

test("testFireEventKO", () => {
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testFireEventChangeState", () => {
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(std);
});

test("testGetterCurrentState", () => {
    const states = Array<OutputState>();
    const dispo = fsm.currentStateObservable().subscribe(elt => states.push(elt[1]));
    fsm.process(new StubEvent());
    dispo.unsubscribe();
    expect(states.length).toBe(1);
    expect(fsm.currentState).toEqual(states[0]);
});

test("testFireEventTriggerFSMStartUpdate", () => {
    fsm.process(new StubEvent());
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testFire2EventsToEnd", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testFireEventTriggerFSMUpdate", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("testFireThreeEventRestartOK", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("testCancellation", () => {
    std.clearTransitions();
    new StubTransitionOK(std, cancelling);
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testRecycleEvent", () => {
    fsm.process(new StubEvent());
    fsm.addRemaningEventsToProcess(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(std);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(fsm.getEventsToProcess().length).toEqual(0);
});

test("testNoRecycleEventOnCancel", () => {
    std.clearTransitions();
    new StubTransitionOK(std, cancelling);
    fsm.process(new StubEvent());
    fsm.addRemaningEventsToProcess(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(fsm.getEventsToProcess().length).toEqual(0);
});

test("testReinit", () => {
    fsm.process(new StubEvent());
    fsm.reinit();
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testFullReinit", () => {
    fsm.process(new StubEvent());
    fsm.addRemaningEventsToProcess(new StubEvent());
    fsm.fullReinit();
    expect(fsm.getEventsToProcess().length).toEqual(0);
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testCancelOnStart", () => {
    handler.fsmStarts = jest.fn().mockImplementation(() => {
        throw new CancelFSMException();
    });
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).not.toBeCalled();
    expect(handler.fsmStops).not.toBeCalled();
});

test("testCancelOnUpdate", () => {
    handler.fsmUpdates = jest.fn().mockImplementation(() => {
        throw new CancelFSMException();
    });
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toBeCalled();
});

test("testCancelOnEnd", () => {
    handler.fsmStops = jest.fn().mockImplementation(() => {
        throw new CancelFSMException();
    });
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("testHasStartedReinit", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.isStarted()).toBeFalsy();
});

test("testHasStarted", () => {
    fsm.process(new StubEvent());
    expect(fsm.isStarted()).toBeTruthy();
});
