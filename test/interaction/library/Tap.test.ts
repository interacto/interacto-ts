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
import {createTouchEvent, robot} from "../StubEvents";
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
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        interaction.uninstall();
    });

    test("cannot rebuild the interaction", () => {
        interaction.fsm.buildFSM();
        expect(interaction.fsm.states).toHaveLength(5);
    });

    test("one touchstart", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2}]);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touchstart touchend", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches cancels", () => {
        interaction.processEvent(createTouchEvent("touchstart", 4, canvas));
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("moving after before the touch cancels the tap", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchmove();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    // eslint-disable-next-line jest/expect-expect
    test("one touch data", () => {
        const touch = new TouchDataImpl();
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts = jest.fn(() => {
            touch.copy(interaction.data.taps[0]);
        });
        interaction.fsm.addHandler(newHandler);

        interaction.processEvent(createTouchEvent("touchstart", 5, canvas, 14, 20, 15, 21));
        interaction.processEvent(createTouchEvent("touchend", 5, canvas, 14, 20, 15, 21));

        checkTouchPoint(touch, 15, 21, 14, 20, 5, canvas);
    });
});

describe("tap 2", () => {
    beforeEach(() => {
        interaction = new Tap(2);
        interaction.fsm.addHandler(handler);
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        interaction.uninstall();
    });

    test("moving after before the touches cancels the tap", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchend();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("one touch", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2}])
            .touchend();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch with timeout", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2}])
            .runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("one touch-release with timeout", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("two touches same time", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2}])
            .touchstart({}, [{"identifier": 4}]);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("two touches", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 4}])
            .touchend();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 1}])
            .touchend()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 3}])
            .touchend()
            .touchstart({}, [{"identifier": 4}])
            .touchend();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches data", () => {
        const touch = new TapDataImpl();

        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops = jest.fn(() => {
            interaction.data.taps.forEach(t => {
                touch.addTapData(t);
            });
        });
        interaction.fsm.addHandler(newHandler);
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 12, 27, 14, 28));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas, 12, 27, 14, 28));

        expect(touch.taps).toHaveLength(2);
        checkTouchPoint(touch.taps[0], 16, 21, 15, 20, 3, canvas);
    });
});

describe("tap 3", () => {
    beforeEach(() => {
        interaction = new Tap(3);
        interaction.fsm.addHandler(handler);
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        interaction.uninstall();
    });

    test("two taps", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 4}])
            .touchend();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with timeout", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 4}])
            .touchend()
            .runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("three touches", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 4}])
            .touchend()
            .touchstart({}, [{"identifier": 5}])
            .touchend();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend()
            .touchstart({}, [{"identifier": 4}])
            .touchend()
            .touchstart({}, [{"identifier": 5}])
            .touchend()
            .touchstart({}, [{"identifier": 1}])
            .touchend()
            .touchstart({}, [{"identifier": 7}])
            .touchend()
            .touchstart({}, [{"identifier": 6}])
            .touchend();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches data", () => {
        const touch = new TapDataImpl();

        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops = jest.fn(() => {
            interaction.data.taps.forEach(t => {
                touch.addTapData(t);
            });
        });
        interaction.fsm.addHandler(newHandler);
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 12, 27, 14, 28));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas, 12, 27, 14, 28));
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 112, 217, 114, 128));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas, 112, 217, 114, 128));

        expect(touch.taps).toHaveLength(3);
        checkTouchPoint(touch.taps[0], 16, 21, 15, 20, 3, canvas);
    });
});
