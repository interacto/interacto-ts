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

import {CancelFSMException} from "../../src/impl/fsm/CancelFSMException";
import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {InputState} from "../../src/api/fsm/InputState";
import {OutputState} from "../../src/api/fsm/OutputState";
import {TimeoutTransition} from "../../src/impl/fsm/TimeoutTransition";
import {mock, MockProxy} from "jest-mock-extended";
import {catFSM} from "../../src/api/logging/ConfigLog";

let evt: TimeoutTransition;
let src: OutputState & MockProxy<OutputState>;
let tgt: InputState & MockProxy<InputState>;
let fsm: FSMImpl & MockProxy<FSMImpl>;

beforeEach(() => {
    jest.useFakeTimers();
    fsm = mock<FSMImpl>();
    src = mock<OutputState>();
    tgt = mock<InputState>();
    src.getFSM.mockReturnValue(fsm);
    tgt.getFSM.mockReturnValue(fsm);
    evt = new TimeoutTransition(src, tgt, () => 500);
});

afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
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
    tgt.enter.mockImplementation((): void => {
        throw new CancelFSMException();
    });
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    expect(() => evt.execute(undefined)).toThrow(CancelFSMException);
});

test("fsm throws exception in thread", () => {
    const ex = new Error("foo");
    jest.spyOn(catFSM, "error");
    jest.spyOn(fsm, "onTimeout");
    fsm.onTimeout.mockImplementation((): void => {
        throw ex;
    });
    evt.startTimeout();
    jest.runOnlyPendingTimers();
    expect(catFSM.error).toHaveBeenCalledWith("Exception on timeout of a timeout transition", ex);
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
