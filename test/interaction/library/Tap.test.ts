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

import {Tap, TouchDataImpl} from "../../../src/interacto";
import {checkTouchPoint} from "../../Utils";
import {robot} from "../StubEvents";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a Tap interaction", () => {
    let interaction: Tap;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        jest.useFakeTimers();
        handler = mock<FSMHandler>();
        canvas = document.createElement("canvas");
        logger = mock<Logger>();
        interaction = new Tap(logger);
        interaction.fsm.addHandler(handler);
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        interaction.uninstall();
        jest.clearAllMocks();
        jest.clearAllTimers();
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

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(3);
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

    test("moving after before the touch cancels the Taps", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchmove();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("one touch data", () => {
        const touch = new TouchDataImpl();
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts = jest.fn(() => {
            touch.copy(interaction.data);
        });
        interaction.fsm.addHandler(newHandler);

        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 5, "screenX": 14, "screenY": 20, "clientX": 15, "clientY": 21}])
            .touchend();

        checkTouchPoint(touch, 15, 21, 14, 20, 5, canvas);
    });

    test("data clear ok", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchend();

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.allTouches).toHaveLength(0);
        expect(interaction.data.screenX).toBe(0);
        expect(interaction.data.target).toBeNull();
    });
});
