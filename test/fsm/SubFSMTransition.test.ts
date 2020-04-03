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

import { FSM } from "../../src/fsm/FSM";
import { InputState } from "../../src/fsm/InputState";
import { StdState } from "../../src/fsm/StdState";
import { SubFSMTransition } from "../../src/fsm/SubFSMTransition";
import { TerminalState } from "../../src/fsm/TerminalState";
import { Transition } from "../../src/fsm/Transition";
import { StubSubEvent1, StubSubEvent2 } from "./StubEvent";
import { SubStubTransition1 } from "./StubTransitionOK";

jest.mock("../../src/fsm/StdState");

let tr: SubFSMTransition;
let fsm: FSM;
let mainfsm: FSM;
let s1: StdState;
let s2: StdState;
let subS: TerminalState;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSM();
    mainfsm = new FSM();
    s1 = new StdState(mainfsm, "s1");
    s2 = new StdState(mainfsm, "s2");
    s1.getFSM = jest.fn().mockReturnValue(mainfsm);
    s2.getFSM = jest.fn().mockReturnValue(mainfsm);
    mainfsm.addState(s1);
    mainfsm.addState(s2);
    tr = new SubFSMTransition(s1, s2, fsm);

    subS = new TerminalState(fsm, "sub1");
    new SubStubTransition1(fsm.initState, subS, true);
    fsm.addState(subS);
});

test("testInner", () => {
    expect(fsm.getInner()).toBeTruthy();
    expect(mainfsm.getInner()).toBeFalsy();
});

test("testAcceptFirstEvent", () => {
    expect(tr.accept(new StubSubEvent1())).toBeTruthy();
});

test("testNotAcceptFirstEvent", () => {
    expect(tr.accept(new StubSubEvent2())).toBeFalsy();
});

test("testGuardOKFirstEvent", () => {
    expect(tr.isGuardOK(new StubSubEvent1())).toBeTruthy();
});

test("testGuardKOFirstEvent", () => {
    expect(tr.isGuardOK(new StubSubEvent2())).toBeFalsy();
});

test("testExecuteFirstEventReturnsSubState", () => {
    const state: InputState | undefined = tr.execute(new StubSubEvent1());
    expect(state).not.toBeUndefined();
    expect(state).toStrictEqual(subS);
});

test("execute no transition", () => {
    const state: InputState | undefined = tr.execute(new StubSubEvent2());
    expect(state).toBeUndefined();
});

test("testExecuteFirstEventKO", () => {
    const state: InputState | undefined = tr.execute(new StubSubEvent2());
    expect(state).toBeUndefined();
});

test("uninstall", () => {
    tr = new SubFSMTransition(s1, s2, fsm);
    jest.spyOn(fsm, "uninstall");
    tr.uninstall();
    expect(fsm.uninstall).toHaveBeenCalledTimes(1);
});

test("get accepted events", () => {
    const tr2 = {} as Transition;
    tr2.getAcceptedEvents = jest.fn(() => new Set(["foo", "bar"]));
    fsm.initState.addTransition(tr2);
    const evts = tr.getAcceptedEvents();
    expect([...evts]).toHaveLength(3);
    expect(evts.has("foo")).toBeTruthy();
    expect(evts.has("bar")).toBeTruthy();
    expect(evts.has([... fsm.initState.getTransitions()[0].getAcceptedEvents()][0])).toBeTruthy();
});

test("get accepted events when nothing to return", () => {
    fsm.initState.clearTransitions();
    const evts = tr.getAcceptedEvents();
    expect([...evts]).toHaveLength(0);
});

test("testExecuteExitSrcState", () => {
    tr.execute(new StubSubEvent1());
    expect(s1.exit).toHaveBeenCalledTimes(1);
});

test("testExecuteEnterTgtState", () => {
    tr.execute(new StubSubEvent1());
    expect(s2.enter).toHaveBeenCalledTimes(1);
});

