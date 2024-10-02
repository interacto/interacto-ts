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

import {twoTouch} from "../../../src/interacto";
import {checkTouchPoint} from "../../Utils";
import {robot} from "../StubEvents";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger, TwoTouch} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a multi touch interaction", () => {
    let interaction: TwoTouch;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = twoTouch(logger)();
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        interaction.uninstall();
    });

    test("touch1", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 3}]);

        expect(interaction.fsm.getAllConccurFSMs()
            .filter(fsm => fsm.started)).toHaveLength(1);
        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch1 data", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 21, "clientX": 11, "clientY": 23}]);

        expect(interaction.data.touch2.src.identifier).toBe(-1);
        checkTouchPoint(interaction.data.touch1.src, 11, 23, 10, 21, 2, canvas);
        checkTouchPoint(interaction.data.touch1.tgt, 11, 23, 10, 21, 2, canvas);
    });

    test("touch2", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}]);

        expect(interaction.fsm.getAllConccurFSMs()
            .filter(fsm => fsm.started)).toHaveLength(2);
        expect(interaction.isRunning()).toBeTruthy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch2 data", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1, "screenX": 11, "screenY": 23, "clientX": 11, "clientY": 23}])
            .touchstart({}, [{"identifier": 2, "screenX": 21, "screenY": 13, "clientX": 21, "clientY": 13}]);

        checkTouchPoint(interaction.data.touch1.src, 11, 23, 11, 23, 1, canvas);
        checkTouchPoint(interaction.data.touch1.tgt, 11, 23, 11, 23, 1, canvas);

        checkTouchPoint(interaction.data.touch2.src, 21, 13, 21, 13, 2, canvas);
        checkTouchPoint(interaction.data.touch2.tgt, 21, 13, 21, 13, 2, canvas);
    });

    test("touch3", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 3}])
            .touchstart({}, [{"identifier": 2}]);

        expect(interaction.fsm.getAllConccurFSMs()
            .filter(fsm => fsm.started)).toHaveLength(0);
        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("touch1 touch2 move3", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchmove({}, [{"identifier": 2}]);

        expect(interaction.isRunning()).toBeTruthy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch1 touch2 move2 release2", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchmove({}, [{"identifier": 2}])
            .touchend({}, [{"identifier": 2}]);

        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch1 touch2 move2 release2 touch3", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchmove({}, [{"identifier": 2}])
            .touchend({}, [{"identifier": 2}])
            .touchstart({}, [{"identifier": 3}])
            .touchmove({}, [{"identifier": 3}]);

        expect(interaction.isRunning()).toBeTruthy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });
});
