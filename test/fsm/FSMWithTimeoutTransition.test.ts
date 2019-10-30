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

import {StubEvent} from "./StubEvent";
import {FSM} from "../../src/fsm/FSM";
import {FSMHandler} from "../../src/fsm/FSMHandler";
import {StdState} from "../../src/fsm/StdState";
import {TimeoutTransition} from "../../src/fsm/TimeoutTransition";
import {TerminalState} from "../../src/fsm/TerminalState";
import {StubTransitionOK} from "./StubTransitionOK";
import {StubFSMHandler} from "./StubFSMHandler";
import {CancelFSMException} from "../../src/fsm/CancelFSMException";

jest.mock("./StubFSMHandler");

let fsm: FSM;
let handler: FSMHandler;
let std: StdState;
let std2: StdState;
let terminal: TerminalState;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    fsm = new FSM();
    handler = new StubFSMHandler();
    fsm.addHandler(handler);
    fsm.log(true);
    std = new StdState(fsm, "s1");
    std2 = new StdState(fsm, "s2");
    terminal = new TerminalState(fsm, "t1");
    new StubTransitionOK(fsm.initState, std);
    new StubTransitionOK(std, terminal);
    new TimeoutTransition(std, std2, () => 500);
    new StubTransitionOK(std2, std);
    fsm.addState(std);
    fsm.addState(std2);
    fsm.addState(terminal);
});

test("testTimeoutChangeState", () => {
    fsm.process(new StubEvent());
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
    expect(fsm.currentState).toEqual(std2);
});

test("testTimeoutStoppedOnOtherTransition", () => {
    fsm.process(new StubEvent());
    fsm.process(new StubEvent());
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(clearTimeout).toHaveBeenCalledTimes(1);
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testTimeoutChangeStateThenCancel", () => {
    handler.fsmUpdates = jest.fn().mockImplementation(() => {
        throw new CancelFSMException();
    });
    fsm.process(new StubEvent());
    jest.runOnlyPendingTimers();
    expect(fsm.currentState).toEqual(fsm.initState);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});
