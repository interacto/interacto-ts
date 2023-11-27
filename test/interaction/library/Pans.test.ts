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

import type {FSMHandler, Logger, TouchDnD} from "../../../src/interacto";
import {bottomPan, hPan, vPan, leftPan, rightPan, topPan} from "../../../src/interacto";
import {robot} from "../StubEvents";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";

describe("using pan interactions", () => {
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;
    let interaction: TouchDnD;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        canvas = document.createElement("canvas");
        document.elementFromPoint = jest.fn().mockImplementation(() => null);
    });

    afterEach(() => {
        jest.clearAllMocks();
        interaction.uninstall();
    });

    describe("using a horizontal pan interaction", () => {
        beforeEach(() => {
            interaction = hPan(logger, true, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        test("touch move horiz ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 20}])
                .touchmove({}, [{"identifier": 2, "screenX": 20, "screenY": 20}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move vert ko", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 20}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 10}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move horiz ko because beyond tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 21}])
                .touchmove({}, [{"identifier": 1, "screenX": 11, "screenY": 10}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move horiz ok because in tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": 9, "screenY": 10}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });

        test("restart after a cancellation", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 20, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 30, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 30, "screenY": 30}])
                .touchend({}, [{"identifier": 1, "screenX": 30, "screenY": 30}])
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 40, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 50, "screenY": 10}])
                .touchend({}, [{"identifier": 1, "screenX": 50, "screenY": 10}]);

            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("restart after a cancellation because of two touches", () => {
            robot()
                .touchstart(canvas, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove(canvas, [{"identifier": 1, "screenX": 20, "screenY": 10}])
                .touchmove(canvas, [{"identifier": 1, "screenX": 30, "screenY": 10}])
                .touchstart(canvas, [{"identifier": 2, "screenX": 31, "screenY": 20}])
                .touchend(canvas, [{"identifier": 1}])
                .touchend(canvas, [{"identifier": 2}])
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 20}])
                .touchmove(canvas, [{"identifier": 2, "screenX": 41, "screenY": 20}])
                .touchend(canvas, [{"identifier": 2, "screenX": 41, "screenY": 20}]);

            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a vertical pan interaction", () => {
        beforeEach(() => {
            interaction = vPan(logger, true, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move vert ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 20}])
                .touchmove({}, [{"identifier": 2, "screenX": 10, "screenY": 10}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move horiz ko", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 20, "screenY": 10}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move vert ko because beyond tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 21, "screenY": 11}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move vert ok because in tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 9}])
                .touchmove({}, [{"identifier": 1, "screenX": 19, "screenY": 5}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a left pan interaction", () => {
        beforeEach(() => {
            interaction = leftPan(logger, true, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move left ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 2, "screenX": 9, "screenY": 10}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move left ko when to right", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 11, "screenY": 10}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move left ko when to top beyond threshold", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 9, "screenY": 21}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move left ok when to top too because in tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 9}])
                .touchmove({}, [{"identifier": 1, "screenX": -1, "screenY": 5}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a right pan interaction", () => {
        beforeEach(() => {
            interaction = rightPan(logger, true, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move right ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 2, "screenX": 11, "screenY": 10}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move right ko when to left", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 9, "screenY": 10}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move right ko when to bottom beyond threshold", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 11, "screenY": -1}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move right ok when to top too because in tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 9}])
                .touchmove({}, [{"identifier": 1, "screenX": 20, "screenY": 5}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });

        test("it stops", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 9}])
                .touchmove({}, [{"identifier": 1, "screenX": 20, "screenY": 5}])
                .touchend({}, [{"identifier": 1, "screenX": 20, "screenY": 5}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a top pan interaction", () => {
        beforeEach(() => {
            interaction = topPan(logger, true, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move top ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 2, "screenX": 10, "screenY": 9}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move top ko when to bottom", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 11}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move top ko when to right beyond threshold", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 21, "screenY": 0}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move top ok when to right too because in tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 9}])
                .touchmove({}, [{"identifier": 1, "screenX": 20, "screenY": 5}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a bottom pan interaction", () => {
        beforeEach(() => {
            interaction = bottomPan(logger, true, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move bottom ok", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 2, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 2, "screenX": 10, "screenY": 11}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move bottom ko when to top", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 9}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move bottom ko when to right beyond threshold", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 10}])
                .touchmove({}, [{"identifier": 1, "screenX": 21, "screenY": 20}]);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move bottom ok when to right too because in tolerance rate", () => {
            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 9}])
                .touchmove({}, [{"identifier": 1, "screenX": 20, "screenY": 15}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a pan interaction and a minimal distance", () => {
        test("with a HPan and minimal distance OK", () => {
            interaction = hPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": 110, "screenY": 20}])
                .touchend({}, [{"identifier": 1, "screenX": 110, "screenY": 20}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a HPan and minimal distance KO", () => {
            interaction = hPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": 110, "screenY": 20}])
                .touchend({}, [{"identifier": 1, "screenX": 109, "screenY": 20}]);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a VPan and minimal distance OK", () => {
            interaction = vPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 100}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 200}])
                .touchend({}, [{"identifier": 1, "screenX": 10, "screenY": 200}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a VPan and minimal distance KO", () => {
            interaction = vPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 100}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 199}])
                .touchend({}, [{"identifier": 1, "screenX": 10, "screenY": 199}]);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a LeftPan and minimal distance OK", () => {
            interaction = leftPan(logger, false, 1, 50)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": -40, "screenY": 20}])
                .touchend({}, [{"identifier": 1, "screenX": -40, "screenY": 20}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a LeftPan and minimal distance KO", () => {
            interaction = leftPan(logger, false, 1, 20)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 100, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": 81, "screenY": 20}])
                .touchend({}, [{"identifier": 1, "screenX": 81, "screenY": 20}]);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a RightPan and minimal distance OK", () => {
            interaction = rightPan(logger, false, 1, 1)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 0, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": 2, "screenY": 20}])
                .touchend({}, [{"identifier": 1, "screenX": 2, "screenY": 20}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a RightPan and minimal distance KO", () => {
            interaction = rightPan(logger, false, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 50, "screenY": 19}])
                .touchmove({}, [{"identifier": 1, "screenX": 59, "screenY": 20}])
                .touchend({}, [{"identifier": 1, "screenX": 59, "screenY": 20}]);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a TopPan and minimal distance OK", () => {
            interaction = topPan(logger, false, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 100}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 90}])
                .touchend({}, [{"identifier": 1, "screenX": 10, "screenY": 90}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a TopPan and minimal distance KO", () => {
            interaction = topPan(logger, false, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 100}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 91}])
                .touchend({}, [{"identifier": 1, "screenX": 10, "screenY": 91}]);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a BottomPan and minimal distance OK", () => {
            interaction = bottomPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 110}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 210}])
                .touchend({}, [{"identifier": 1, "screenX": 10, "screenY": 210}]);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a BottomPan and minimal distance KO", () => {
            interaction = bottomPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .touchstart({}, [{"identifier": 1, "screenX": 10, "screenY": 100}])
                .touchmove({}, [{"identifier": 1, "screenX": 10, "screenY": 199}])
                .touchend({}, [{"identifier": 1, "screenX": 10, "screenY": 199}]);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });
});
