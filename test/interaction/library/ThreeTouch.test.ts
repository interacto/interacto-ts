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

import {ThreeTouchDnD} from "../../../src/interacto";
import {checkTouchPoint} from "../../Utils";
import {robot} from "../StubEvents";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a multi touch interaction", () => {
    let interaction: ThreeTouchDnD;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new ThreeTouchDnD(logger);
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        interaction.uninstall();
    });

    test("touch1 touch2 does not start", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 3}])
            .touchstart({}, [{"identifier": 1}]);

        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(interaction.fsm.conccurFSMs
            .filter(fsm => fsm.started)).toHaveLength(2);
    });

    // eslint-disable-next-line jest/expect-expect
    test("touch1 touch2 data", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2, "screenX": 11, "screenY": 23, "clientX": 11, "clientY": 23}])
            .touchstart({}, [{"identifier": 1, "screenX": 21, "screenY": 13, "clientX": 21, "clientY": 13}])
            .touchmove({}, [{"identifier": 2, "screenX": 211, "screenY": 223, "clientX": 211, "clientY": 223}])
            .touchmove({}, [{"identifier": 1, "screenX": 111, "screenY": 123, "clientX": 111, "clientY": 123}]);

        checkTouchPoint(interaction.data.touch1.src, 11, 23, 11, 23, 2, canvas);
        checkTouchPoint(interaction.data.touch1.tgt, 211, 223, 211, 223, 2, canvas);
        checkTouchPoint(interaction.data.touch2.src, 21, 13, 21, 13, 1, canvas);
        checkTouchPoint(interaction.data.touch2.tgt, 111, 123, 111, 123, 1, canvas);
    });

    test("touch2", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}]);

        expect(interaction.fsm.conccurFSMs
            .filter(fsm => fsm.started)).toHaveLength(2);
        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    // eslint-disable-next-line jest/expect-expect
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

        expect(interaction.fsm.conccurFSMs
            .filter(fsm => fsm.started)).toHaveLength(3);
        expect(interaction.isRunning()).toBeTruthy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    // eslint-disable-next-line jest/expect-expect
    test("touch3 data", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1, "screenX": 11, "screenY": 23, "clientX": 11, "clientY": 23}])
            .touchstart({}, [{"identifier": 2, "screenX": 21, "screenY": 13, "clientX": 21, "clientY": 13}])
            .touchstart({}, [{"identifier": 3, "screenX": 221, "screenY": 123, "clientX": 221, "clientY": 123}])
            .touchmove({}, [{"identifier": 3, "screenX": 2221, "screenY": 2123, "clientX": 2221, "clientY": 2123}]);

        checkTouchPoint(interaction.data.touch3.src, 221, 123, 221, 123, 3, canvas);
        checkTouchPoint(interaction.data.touch3.tgt, 2221, 2123, 2221, 2123, 3, canvas);
    });

    test("touch4", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 3}])
            .touchstart({}, [{"identifier": 2}])
            .touchstart({}, [{"identifier": 4}]);

        expect(interaction.fsm.conccurFSMs
            .filter(fsm => fsm.started)).toHaveLength(0);
        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("touch1 touch2 touch3 move2 release2", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchstart({}, [{"identifier": 3}])
            .touchmove({}, [{"identifier": 2}])
            .touchend({}, [{"identifier": 2}]);

        expect(interaction.isRunning()).toBeFalsy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch1 touch2 touch3 move2 release2 touch4", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchstart({}, [{"identifier": 3}])
            .touchmove({}, [{"identifier": 2}])
            .touchend({}, [{"identifier": 2}])
            .touchstart({}, [{"identifier": 4}])
            .touchmove({}, [{"identifier": 4}]);

        expect(interaction.isRunning()).toBeTruthy();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });
});
