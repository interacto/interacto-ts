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

import {StubEvent, StubSubEvent1, StubSubEvent2, StubSubEvent3} from "./StubEvent";
import {StdState} from "../../src/src-core/fsm/StdState";
import {TerminalState} from "../../src/src-core/fsm/TerminalState";
import {CancellingState} from "../../src/src-core/fsm/CancellingState";
import {StubTransitionOK, SubStubTransition1, SubStubTransition2, SubStubTransition3} from "./StubTransitionOK";
import {FSMHandler} from "../../src/src-core/fsm/FSMHandler";
import {StubFSMHandler} from "./StubFSMHandler";
import {FSM} from "../../src/src-core/fsm/FSM";

jest.mock("./StubFSMHandler");

let fsm: FSM<StubEvent>;
let std: StdState<StubEvent>;
let terminal: TerminalState<StubEvent>;
let cancel: CancellingState<StubEvent>;
let iToS: StubTransitionOK;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSM<StubEvent>();
    handler = new StubFSMHandler();
    fsm.addHandler(handler);
    fsm.log(true);
    std = new StdState(fsm, "s1");
    terminal = new TerminalState(fsm, "t1");
    cancel = new CancellingState(fsm, "c1");
    iToS = new StubTransitionOK(fsm.initState, std);
    new SubStubTransition1(std, terminal, true);
    new SubStubTransition2(std, cancel, true);
    new SubStubTransition3(std, std, true);
    fsm.addState(std);
    fsm.addState(terminal);
    fsm.addState(cancel);
});

test("testNotTriggeredIfGuardKO", () => {
    iToS.guard = false;
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("testNotTriggeredIfNotGoodEvent", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(fsm.currentState).toEqual(std);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testTriggerGoodChoice", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubSubEvent2());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testHasStartedReinitOnCancel", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubSubEvent2());
    expect(fsm.isStarted()).toBeFalsy();
});

test("testTriggerGoodChoice2", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubSubEvent1());
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("Check onstart not called when starting state diff", () => {
    fsm.startingState = terminal;
    fsm.process(new StubEvent());
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("testStartingStateNotTriggeredSoNoUpdate", () => {
    fsm.startingState = terminal;
    fsm.process(new StubEvent());
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
});

test("testStartingStateNotTriggeredSoNoCancel", () => {
    fsm.startingState = terminal;
    fsm.process(new StubEvent());
    fsm.process(new StubSubEvent2());
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("testStartingStateTriggeredOnTerminal", () => {
    fsm.startingState = terminal;
    fsm.process(new StubEvent());
    fsm.process(new StubSubEvent1());
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("testStartingStateOnRecursion", () => {
    fsm.startingState = std;
    fsm.process(new StubEvent());
    fsm.process(new StubSubEvent3());
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
