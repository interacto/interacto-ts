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

import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {InputState} from "../../src/api/fsm/InputState";
import {StdState} from "../../src/impl/fsm/StdState";
import {SubFSMTransition} from "../../src/impl/fsm/SubFSMTransition";
import {TerminalState} from "../../src/impl/fsm/TerminalState";
import {SubStubTransition1} from "./StubTransitionOK";
import type {Transition} from "../../src/api/fsm/Transition";
import {createMouseEvent} from "../interaction/StubEvents";

jest.mock("../../src/impl/fsm/StdState");

let tr: SubFSMTransition;
let fsm: FSMImpl;
let mainfsm: FSMImpl;
let s1: StdState;
let s2: StdState;
let subS: TerminalState;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSMImpl();
    mainfsm = new FSMImpl();
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
    expect(tr.accept(createMouseEvent("click", document.createElement("button")))).toBeTruthy();
});

test("testNotAcceptFirstEvent", () => {
    expect(tr.accept(createMouseEvent("mousemove", document.createElement("button")))).toBeFalsy();
});

test("testGuardOKFirstEvent", () => {
    expect(tr.isGuardOK(createMouseEvent("click", document.createElement("button")))).toBeTruthy();
});

test("testGuardKOFirstEvent", () => {
    expect(tr.isGuardOK(createMouseEvent("mousemove", document.createElement("button")))).toBeFalsy();
});

test("testExecuteFirstEventReturnsSubState", () => {
    const state: InputState | undefined = tr.execute(createMouseEvent("click", document.createElement("button")));
    expect(state).toBeDefined();
    expect(state).toStrictEqual(subS);
});

test("execute no transition", () => {
    const state: InputState | undefined = tr.execute(createMouseEvent("mousemove", document.createElement("button")));
    expect(state).toBeUndefined();
});

test("testExecuteFirstEventKO", () => {
    const state: InputState | undefined = tr.execute(createMouseEvent("mousemove", document.createElement("button")));
    expect(state).toBeUndefined();
});

test("uninstall", () => {
    tr = new SubFSMTransition(s1, s2, fsm);
    jest.spyOn(fsm, "uninstall");
    tr.uninstall();
    expect(fsm.uninstall).toHaveBeenCalledTimes(1);
});

test("get accepted events", () => {
    const tr2 = {} as Transition<Event>;
    tr2.getAcceptedEvents = jest.fn(() => ["click", "auxclick"]);
    fsm.initState.addTransition(tr2);
    const evts = tr.getAcceptedEvents();
    expect([...evts]).toHaveLength(3);
    expect(evts.includes("click")).toBeTruthy();
    expect(evts.includes("auxclick")).toBeTruthy();
    expect(evts.includes([...fsm.initState.getTransitions()[0].getAcceptedEvents()][0])).toBeTruthy();
});

test("get accepted events when nothing to return", () => {
    fsm.initState.clearTransitions();
    const evts = tr.getAcceptedEvents();
    expect([...evts]).toHaveLength(0);
});

test("testExecuteExitSrcState", () => {
    tr.execute(createMouseEvent("click", document.createElement("button")));
    expect(s1.exit).toHaveBeenCalledTimes(1);
});

test("testExecuteEnterTgtState", () => {
    tr.execute(createMouseEvent("click", document.createElement("button")));
    expect(s2.enter).toHaveBeenCalledTimes(1);
});

