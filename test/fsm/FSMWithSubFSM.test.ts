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

import {StubSubEvent1, StubSubEvent2} from "./StubEvent";
import {FSM} from "../../src/fsm/FSM";
import {CancellingState} from "../../src/fsm/CancellingState";
import {SubStubTransition1, SubStubTransition2} from "./StubTransitionOK";
import {TerminalState} from "../../src/fsm/TerminalState";
import {StubFSMHandler} from "./StubFSMHandler";
import {StdState} from "../../src/fsm/StdState";
import {FSMHandler} from "../../src/fsm/FSMHandler";
import {SubFSMTransition} from "../../src/fsm/SubFSMTransition";

jest.mock("./StubFSMHandler");


let fsm: FSM;
let handler: FSMHandler;
let mainfsm: FSM;
let s1: StdState;
let subS1: StdState;
let subS2: StdState;
let subT: TerminalState;
let subC: CancellingState;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    fsm = new FSM();
    mainfsm = new FSM();
    s1 = new StdState(mainfsm, "s1");
    mainfsm.addState(s1);
    new SubFSMTransition(mainfsm.initState, s1, fsm);
    mainfsm.addHandler(handler);
    subS1 = new StdState(fsm, "sub1");
    subS2 = new StdState(fsm, "sub2");
    subT = new TerminalState(fsm, "t1");
    subC = new CancellingState(fsm, "c1");
    new SubStubTransition1(fsm.initState, subS1, true);
    new SubStubTransition2(subS1, subS2, true);
    new SubStubTransition1(subS2, subT, true);
    new SubStubTransition2(subS2, subC, true);
    fsm.addState(subS1);
    fsm.addState(subS2);
    fsm.addState(subT);
    fsm.addState(subC);
});

test("testEntersSubGoodCurrState", () => {
    mainfsm.process(new StubSubEvent1());
    expect(mainfsm.currentState).toEqual(subS1);
    expect(fsm.currentState).toEqual(subS1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("testNextSubStarteChangesMainCurrState", () => {
    mainfsm.process(new StubSubEvent1());
    mainfsm.process(new StubSubEvent2());
    expect(mainfsm.currentState).toEqual(subS2);
    expect(fsm.currentState).toEqual(subS2);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("testEntersSubTerminalGoNextMain", () => {
    mainfsm.process(new StubSubEvent1());
    mainfsm.process(new StubSubEvent2());
    mainfsm.process(new StubSubEvent1());
    expect(mainfsm.currentState).toEqual(s1);
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStops).not.toBeCalled();
    expect(handler.fsmCancels).not.toBeCalled();
});

test("testEntersSubCancelCancelsMain", () => {
    mainfsm.process(new StubSubEvent1());
    mainfsm.process(new StubSubEvent2());
    mainfsm.process(new StubSubEvent2());
    expect(mainfsm.currentState).toEqual(mainfsm.initState);
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStops).not.toBeCalled();
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("testReinitAlsoSubFSM", () => {
    mainfsm.process(new StubSubEvent1());
    mainfsm.process(new StubSubEvent2());
    mainfsm.fullReinit();
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testExitSubGoIntoCancelling", () => {
    const cancel: CancellingState = new CancellingState(mainfsm, "cancel1");
    mainfsm.addState(cancel);
    mainfsm.initState.clearTransitions();
    new SubFSMTransition(mainfsm.initState, cancel, fsm);
    mainfsm.process(new StubSubEvent1());
    mainfsm.process(new StubSubEvent2());
    mainfsm.process(new StubSubEvent1());
    expect(mainfsm.currentState).toEqual(mainfsm.initState);
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("testExitSubGoIntoTerminal", () => {
    const terminal: TerminalState = new TerminalState(mainfsm, "terminal1");
    mainfsm.addState(terminal);
    mainfsm.initState.clearTransitions();
    new SubFSMTransition(mainfsm.initState, terminal, fsm);
    mainfsm.process(new StubSubEvent1());
    mainfsm.process(new StubSubEvent2());
    mainfsm.process(new StubSubEvent1());
    expect(mainfsm.currentState).toEqual(mainfsm.initState);
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

