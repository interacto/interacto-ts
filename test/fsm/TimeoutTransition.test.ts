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

import {CancelFSMError} from "../../src/impl/fsm/CancelFSMError";
import {TimeoutTransition} from "../../src/impl/fsm/TimeoutTransition";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {InputState} from "../../src/api/fsm/InputState";
import type {OutputState} from "../../src/api/fsm/OutputState";
import type {Logger} from "../../src/api/logging/Logger";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {MockProxy} from "jest-mock-extended";

describe("using a timeout transition", () => {
    let evt: TimeoutTransition;
    let src: MockProxy<OutputState> & OutputState;
    let tgt: InputState & MockProxy<InputState>;
    let fsm: FSMImpl & MockProxy<FSMImpl>;
    let logger: Logger;

    beforeEach(() => {
        logger = mock<Logger>();
        jest.useFakeTimers();
        fsm = mock<FSMImpl>();
        src = mock<OutputState>();
        tgt = mock<InputState>();
        Object.defineProperty(src, "fsm", {
            "get": jest.fn(() => fsm)
        });
        Object.defineProperty(tgt, "fsm", {
            "get": jest.fn(() => fsm)
        });
        evt = new TimeoutTransition(src, tgt, () => 500, logger);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test("guard OK after timeout", () => {
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        expect(evt.guard(new Event("mousedown"))).toBeTruthy();
    });

    test("guard KO before timeout", () => {
        evt.startTimeout();
        expect(evt.guard(new Event("mousedown"))).toBeFalsy();
    });

    test("oKAfterTimeout", () => {
        evt.startTimeout();
        jest.advanceTimersByTime(499);
        expect(fsm.onTimeout).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(fsm.onTimeout).toHaveBeenCalledTimes(1);
        expect(evt.accept(undefined)).toBeTruthy();
    });

    test("kOBeforeTimeout", () => {
        evt.startTimeout();
        expect(evt.accept(undefined)).toBeFalsy();
    });

    test("stopTimeout", () => {
        evt.startTimeout();
        evt.stopTimeout();
        jest.runOnlyPendingTimers();
        expect(evt.guard(new Event("mousedown"))).toBeFalsy();
    });

    test("stop timeout 0", () => {
        evt = new TimeoutTransition(src, tgt, () => 0);
        evt.startTimeout();
        expect(jest.getTimerCount()).toBe(0);
        evt.stopTimeout();
        expect(evt.guard(new Event("mousedown"))).toBeFalsy();
    });

    test("two consecutive starts", () => {
        evt = new TimeoutTransition(src, tgt, () => 300);
        evt.startTimeout();
        evt.startTimeout();
        expect(jest.getTimerCount()).toBe(1);
        evt.stopTimeout();
        expect(evt.guard(new Event("mousedown"))).toBeFalsy();
    });

    test("stop when not started", () => {
        evt.stopTimeout();
        expect(jest.getTimerCount()).toBe(0);
        expect(evt.guard(new Event("mousedown"))).toBeFalsy();
    });

    test("getAcceptEventsEmpty", () => {
        expect(evt.getAcceptedEvents()).toStrictEqual(new Set());
    });

    test("executeWithoutTimeout", () => {
        expect(evt.execute(undefined)).toBeUndefined();
    });

    test("executeWithTimeout", () => {
        evt.startTimeout();
        setTimeout(() => {}, 100);
        jest.runOnlyPendingTimers();
        expect(evt.execute(undefined)).toStrictEqual(tgt);
    });

    test("execute cancels", () => {
        jest.spyOn(tgt, "enter");
        tgt.enter.mockImplementation((): void => {
            throw new CancelFSMError();
        });
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        expect(() => evt.execute(undefined)).toThrow(CancelFSMError);
    });

    test("fsm throws error in thread", () => {
        const ex = new Error("foo");
        jest.spyOn(fsm, "onTimeout");
        fsm.onTimeout.mockImplementation((): void => {
            throw ex;
        });
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        expect(logger.logInteractionErr).toHaveBeenCalledWith("Exception on timeout of a timeout transition", ex);
    });

    test("fsm throws not an error in thread", () => {
        jest.spyOn(fsm, "onTimeout");
        fsm.onTimeout.mockImplementation((): void => {
            throw 42;
        });
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        expect(logger.logInteractionErr).toHaveBeenCalledWith("Exception on timeout of a timeout transition", 42);
    });

    test("fsm throws not an error in thread with no logger", () => {
        evt = new TimeoutTransition(src, tgt, () => 500);
        jest.spyOn(fsm, "onTimeout");
        fsm.onTimeout.mockImplementation((): void => {
            throw 42;
        });
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        expect(logger.logInteractionErr).not.toHaveBeenCalled();
    });

    test("executeCallFSMTimeout", () => {
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        expect(fsm.onTimeout).toHaveBeenCalledTimes(1);
    });

    test("executeCallsStatesMethods", () => {
        evt.startTimeout();
        jest.runOnlyPendingTimers();
        evt.execute(undefined);
        expect(src.exit).toHaveBeenCalledTimes(1);
        expect(tgt.enter).toHaveBeenCalledTimes(1);
    });
});
