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
import { OutputState } from "../../src/fsm/OutputState";
import { TimeoutTransition } from "../../src/fsm/TimeoutTransition";
import { StdState } from "../../src/fsm/StdState";

jest.mock("../../src/fsm/FSM");
jest.mock("../../src/fsm/StdState");

let evt: TimeoutTransition;
let src: OutputState;
let tgt: InputState;
let fsm: FSM;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    fsm = new FSM();
    src = new StdState(fsm, "src");
    tgt = new StdState(fsm, "tgt");
    src.getFSM = jest.fn().mockReturnValue(fsm);
    tgt.getFSM = jest.fn().mockReturnValue(fsm);
    evt = new TimeoutTransition(src, tgt, () => 500);
});

test("testIsGuardOKAfterTimeout", () => {
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    expect(evt.isGuardOK(undefined)).toBeTruthy();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
});

test("testIsGuardKOBeforeTimeout", () => {
    evt.startTimeout();
    expect(evt.isGuardOK(undefined)).toBeFalsy();
});

test("testacceptOKAfterTimeout", () => {
    evt.startTimeout();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
    setTimeout(() => {
    }, 100);
    jest.runOnlyPendingTimers();
    expect(evt.accept(undefined)).toBeTruthy();
});

test("testacceptKOBeforeTimeout", () => {
    evt.startTimeout();
    expect(evt.accept(undefined)).toBeFalsy();
});

test("testStopTimeout", () => {
    evt.startTimeout();
    evt.stopTimeout();
    setTimeout(() => {
    }, 100);
    jest.runOnlyPendingTimers();
    expect(evt.isGuardOK(undefined)).toBeFalsy();
});

test("testGetAcceptEventsEmpty", () => {
    expect(evt.getAcceptedEvents().size).toEqual(0);
});

test("testExecuteWithoutTimeout", () => {
    expect(evt.execute(undefined).isPresent()).toBeFalsy();
});

test("testExecuteWithTimeout", () => {
    evt.startTimeout();
    setTimeout(() => {
    }, 100);
    jest.runOnlyPendingTimers();
    expect(evt.execute(undefined).get()).toEqual(tgt);
});

test("testExecuteCallFSMTimeout", () => {
    evt.startTimeout();
    setTimeout(() => {
    }, 100);
    jest.runOnlyPendingTimers();
    expect(fsm.onTimeout).toHaveBeenCalledTimes(1);
});

test("testExecuteCallsStatesMethods", () => {
    evt.startTimeout();
    setTimeout(() => {
    }, 100);
    jest.runOnlyPendingTimers();
    evt.execute(undefined);
    expect(src.exit).toHaveBeenCalledTimes(1);
    expect(tgt.enter).toHaveBeenCalledTimes(1);
});
