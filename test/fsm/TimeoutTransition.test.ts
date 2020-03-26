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

import { ErrorCatcher } from "../../src/error/ErrorCatcher";
import { CancelFSMException } from "../../src/fsm/CancelFSMException";
import { FSM } from "../../src/fsm/FSM";
import { InputState } from "../../src/fsm/InputState";
import { OutputState } from "../../src/fsm/OutputState";
import { StdState } from "../../src/fsm/StdState";
import { TimeoutTransition } from "../../src/fsm/TimeoutTransition";

jest.mock("../../src/fsm/FSM");
jest.mock("../../src/fsm/StdState");

let evt: TimeoutTransition;
let src: OutputState;
let tgt: InputState;
let fsm: FSM;

beforeEach(() => {
    jest.useFakeTimers();
    fsm = new FSM();
    src = new StdState(fsm, "src");
    tgt = new StdState(fsm, "tgt");
    src.getFSM = jest.fn().mockReturnValue(fsm);
    tgt.getFSM = jest.fn().mockReturnValue(fsm);
    evt = new TimeoutTransition(src, tgt, () => 500);
});

afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    ErrorCatcher.setInstance(new ErrorCatcher());
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
    jest.runOnlyPendingTimers();
    expect(evt.isGuardOK(undefined)).toBeFalsy();
});

test("stop timeout 0", () => {
    evt = new TimeoutTransition(src, tgt, () => 0);
    evt.startTimeout();
    expect(jest.getTimerCount()).toStrictEqual(0);
    evt.stopTimeout();
    expect(evt.isGuardOK(undefined)).toBeFalsy();
});

test("two consecutive starts", () => {
    evt = new TimeoutTransition(src, tgt, () => 300);
    evt.startTimeout();
    evt.startTimeout();
    expect(jest.getTimerCount()).toStrictEqual(1);
    evt.stopTimeout();
    expect(evt.isGuardOK(undefined)).toBeFalsy();
});

test("stop when not started", () => {
    evt.stopTimeout();
    expect(jest.getTimerCount()).toStrictEqual(0);
    expect(evt.isGuardOK(undefined)).toBeFalsy();
});

test("testGetAcceptEventsEmpty", () => {
    expect(evt.getAcceptedEvents().size).toStrictEqual(0);
});

test("testExecuteWithoutTimeout", () => {
    expect(evt.execute(undefined)).toBeUndefined();
});

test("testExecuteWithTimeout", () => {
    evt.startTimeout();
    setTimeout(() => {
    }, 100);
    jest.runOnlyPendingTimers();
    expect(evt.execute(undefined)).toStrictEqual(tgt);
});

test("execute and guard not OK", () => {
    evt = new class extends TimeoutTransition {
        public constructor() {
            super(src, tgt, () => 50);
        }
        public isGuardOK(_event: Event): boolean {
            return false;
        }
    }();
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    expect(evt.execute(undefined)).toBeUndefined();
});

test("execute cancels", () => {
    jest.spyOn(tgt, "enter");
    tgt.enter = jest.fn((): void => {
        throw new CancelFSMException();
    });
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    expect(() => evt.execute(undefined)).toThrow(CancelFSMException);
});

test("fsm throws exception in thread", () => {
    const ex = new Error("foo");
    const errors: Array<Error> = [];
    const disposable = ErrorCatcher.getInstance().getErrors().subscribe(err => errors.push(err));
    jest.spyOn(fsm, "onTimeout");
    fsm.onTimeout = jest.fn((): void => {
        throw ex;
    });
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    disposable.unsubscribe();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe(ex);
});

test("testExecuteCallFSMTimeout", () => {
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    expect(fsm.onTimeout).toHaveBeenCalledTimes(1);
});

test("testExecuteCallsStatesMethods", () => {
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    evt.execute(undefined);
    expect(src.exit).toHaveBeenCalledTimes(1);
    expect(tgt.enter).toHaveBeenCalledTimes(1);
});
