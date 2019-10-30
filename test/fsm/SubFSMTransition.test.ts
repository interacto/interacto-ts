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
import {TerminalState} from "../../src/fsm/TerminalState";
import {StdState} from "../../src/fsm/StdState";
import {FSM} from "../../src/fsm/FSM";
import {SubFSMTransition} from "../../src/fsm/SubFSMTransition";
import {SubStubTransition1} from "./StubTransitionOK";
import {InputState} from "../../src/fsm/InputState";
import {Optional} from "../../src/util/Optional";

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
    expect(fsm.inner).toBeTruthy();
    expect(mainfsm.inner).toBeFalsy();
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
    const state : Optional<InputState> = tr.execute(new StubSubEvent1());
    expect(state.isPresent()).toBeTruthy();
    expect(state.get()).toEqual(subS);
});

test("testExecuteFirstEventKO", () => {
    const state : Optional<InputState> = tr.execute(new StubSubEvent2());
    expect(state.isPresent()).toBeFalsy();
});

test("testExecuteExitSrcState", () => {
    tr.execute(new StubSubEvent1());
    expect(s1.exit).toHaveBeenCalledTimes(1);
});

test("testExecuteEnterTgtState", () => {
    tr.execute(new StubSubEvent1());
    expect(s2.enter).toHaveBeenCalledTimes(1);
});

