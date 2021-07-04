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

import type {FSMHandler} from "../../../src/interacto";
import {Tap, TapDataImpl, TouchDataImpl} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";
import {checkTouchPoint} from "../../Utils";

let interaction: Tap;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    canvas = document.createElement("canvas");
});

afterEach(() => {
    interaction.uninstall();
    jest.clearAllMocks();
    jest.clearAllTimers();
});

describe("tap 1", () => {
    beforeEach(() => {
        interaction = new Tap(1);
        interaction.fsm.addHandler(handler);
    });

    test("cannot rebuild the interaction", () => {
        interaction.fsm.buildFSM();
        expect(interaction.fsm.states).toHaveLength(4);
    });

    test("one touchend", () => {
        interaction.processEvent(createTouchEvent("touchend", 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touchstart touchend", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch pressure does not work", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with different id", () => {
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        interaction.processEvent(createTouchEvent("touchend", 1, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    // eslint-disable-next-line jest/expect-expect
    test("one touch data", () => {
        const touch = new TouchDataImpl();
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts.mockImplementation(() => {
            touch.copy(interaction.data.taps[0]);
        });
        interaction.fsm.addHandler(newHandler);
        interaction.processEvent(createTouchEvent("touchend", 5, canvas, 14, 20, 15, 21));

        checkTouchPoint(touch, 15, 21, 14, 20, 5, canvas);
    });
});

describe("tap 2", () => {
    beforeEach(() => {
        interaction = new Tap(2);
        interaction.fsm.addHandler(handler);
    });

    test("one touch", () => {
        interaction.processEvent(createTouchEvent("touchend", 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch with timeout", () => {
        interaction.processEvent(createTouchEvent("touchend", 2, canvas));
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with different id", () => {
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        interaction.processEvent(createTouchEvent("touchend", 1, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches data", () => {
        const touch = new TapDataImpl();

        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops.mockImplementation(() => {
            interaction.data.taps.forEach(t => {
                touch.addTapData(t);
            });
        });
        interaction.fsm.addHandler(newHandler);
        interaction.processEvent(createTouchEvent("touchend", 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas, 12, 27, 14, 28));

        expect(touch.taps).toHaveLength(2);
        checkTouchPoint(touch.taps[0], 16, 21, 15, 20, 3, canvas);
    });
});

describe("tap 3", () => {
    beforeEach(() => {
        interaction = new Tap(3);
        interaction.fsm.addHandler(handler);
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with same id with timeout", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("three touches with same id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches with diffent id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 4, canvas));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches data", () => {
        const touch = new TapDataImpl();

        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops.mockImplementation(() => {
            interaction.data.taps.forEach(t => {
                touch.addTapData(t);
            });
        });
        interaction.fsm.addHandler(newHandler);
        interaction.processEvent(createTouchEvent("touchend", 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas, 12, 27, 14, 28));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas, 112, 217, 114, 128));

        expect(touch.taps).toHaveLength(3);
        checkTouchPoint(touch.taps[0], 16, 21, 15, 20, 3, canvas);
    });
});
