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

import {TimedTap, TapDataImpl, TouchDataImpl} from "../../../src/interacto";
import {checkTouchPoint} from "../../Utils";
import {robot} from "../StubEvents";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a timed tap interaction", () => {
    let interaction: TimedTap;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

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
            logger = mock<Logger>();
            interaction = new TimedTap(300, 1, logger);
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("one touchstart", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("log interaction is ok", () => {
            interaction.log(true);
            robot(canvas)
                .touchstart({}, [{"identifier": 2}]);

            expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
        });

        test("no log interaction is ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2}]);

            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
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
            robot(canvas)
                .touchstart({}, [{"identifier": 4}])
                .touchstart({}, [{"identifier": 3}]);

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
                touch.copy(interaction.data.points[0]);
            });
            interaction.fsm.addHandler(newHandler);

            robot(canvas)
                .keepData()
                .touchstart({}, [{"identifier": 5, "screenX": 14, "screenY": 20, "clientX": 15, "clientY": 21}])
                .touchend();

            checkTouchPoint(touch, 15, 21, 14, 20, 5, canvas);
        });
    });

    describe("tap 2", () => {
        beforeEach(() => {
            interaction = new TimedTap(400, 2, mock<Logger>());
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
                .do(() => jest.advanceTimersByTime(400));
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("one touch with delay but not timeout", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2}])
                .do(() => jest.advanceTimersByTime(399));
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
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
                for (const tap of interaction.data.points) {
                    touch.addPoint(tap);
                }
            });
            interaction.fsm.addHandler(newHandler);

            robot(canvas)
                .keepData()
                .touchstart({}, [{"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 16, "clientY": 21}])
                .touchend({}, [{"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 16, "clientY": 21}])
                .touchstart({}, [{"identifier": 2, "screenX": 12, "screenY": 27, "clientX": 14, "clientY": 28}])
                .touchend({}, [{"identifier": 2, "screenX": 12, "screenY": 27, "clientX": 14, "clientY": 28}]);

            expect(touch.points).toHaveLength(2);
            checkTouchPoint(touch.points[0], 16, 21, 15, 20, 3, canvas);
        });
    });

    describe("tap 3", () => {
        beforeEach(() => {
            interaction = new TimedTap(100, 3, mock<Logger>());
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
                for (const tap of interaction.data.points) {
                    touch.addPoint(tap);
                }
            });
            interaction.fsm.addHandler(newHandler);

            robot(canvas)
                .keepData()
                .touchstart({}, [{"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 16, "clientY": 21}])
                .touchend()
                .touchstart({}, [{"identifier": 2, "screenX": 12, "screenY": 27, "clientX": 14, "clientY": 28}])
                .touchend()
                .touchstart({}, [{"identifier": 1, "screenX": 112, "screenY": 217, "clientX": 114, "clientY": 128}])
                .touchend();

            expect(touch.points).toHaveLength(3);
            checkTouchPoint(touch.points[0], 16, 21, 15, 20, 3, canvas);
            expect(touch.points[0].allTouches).toHaveLength(1);
            expect(touch.points[0].allTouches[0].identifier).toBe(3);
        });
    });
});
