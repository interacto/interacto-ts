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

import {bottomPan, hPan, vPan, leftPan, rightPan, topPan} from "../../../src/interacto";
import {robot} from "../StubEvents";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger, TouchDnD} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using pan interactions", () => {
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;
    let interaction: TouchDnD;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        canvas = document.createElement("canvas");
        document.elementFromPoint = jest.fn<() => Element | null>().mockImplementation(() => null);
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

        test("has a good name", () => {
            expect(interaction.name).toBe(hPan.name);
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
                .pan(2, 10, "top", {});

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move horiz ko because beyond tolerance rate", () => {
            robot(canvas)
                .pan(2, 10, "right", {}, 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move horiz ok because in tolerance rate", () => {
            robot(canvas)
                .pan(1, 1, "left", {}, 9);

            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });

        test("restart after a cancellation", () => {
            robot(canvas)
                .pan(1, 50, "left", {}, 20, 3)
                .pan(1, 50, "left", {}, 0, 2);

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

        test("has a good name", () => {
            expect(interaction.name).toBe(vPan.name);
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
                .pan(2, 10, "left", {});

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move vert ko because beyond tolerance rate", () => {
            robot(canvas)
                .pan(3, 20, "top", {}, 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move vert ok because in tolerance rate", () => {
            robot(canvas)
                .pan(3, 20, "top", {}, 10);

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

        test("has a good name", () => {
            expect(interaction.name).toBe(leftPan.name);
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
                .pan(3, 20, "right", {});

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move left ko when to top beyond threshold", () => {
            robot(canvas)
                .pan(3, 20, "left", {}, 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move left ok when to top too because in tolerance rate", () => {
            robot(canvas)
                .pan(3, 20, "left", {}, 10);

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

        test("has a good name", () => {
            expect(interaction.name).toBe(rightPan.name);
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
                .pan(3, 20, "left", {});

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move right ko when to bottom beyond threshold", () => {
            robot(canvas)
                .pan(3, 20, "right", {}, 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move right ok when to top too because in tolerance rate", () => {
            robot(canvas)
                .pan(3, 20, "right", {}, 10);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });

        test("it stops", () => {
            robot(canvas)
                .pan(1, 100, "right", {}, 8, 2);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("clear data", () => {
            robot(canvas)
                .pan(1, 100, "right", {}, 8, 2);

            expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
            expect(interaction.data.src.target).toBeNull();
            expect(interaction.data.tgt.target).toBeNull();
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

        test("has a good name", () => {
            expect(interaction.name).toBe(topPan.name);
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
                .pan(1, 20, "bottom", {});

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move top ko when to right beyond threshold", () => {
            robot(canvas)
                .pan(2, 20, "top", {}, 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move top ok when to right too because in tolerance rate", () => {
            robot(canvas)
                .pan(2, 20, "top", {}, 10);

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

        test("has a good name", () => {
            expect(interaction.name).toBe(bottomPan.name);
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
                .pan(2, 20, "top", {});

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move bottom ko when to right beyond threshold", () => {
            robot(canvas)
                .pan(2, 20, "bottom", {}, 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move bottom ok when to right too because in tolerance rate", () => {
            robot(canvas)
                .pan(2, 20, "bottom", {}, 10);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a pan interaction and a minimal distance", () => {
        test("with a HPan and minimal distance OK", () => {
            interaction = hPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 100, "left", {}, 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a HPan and minimal distance KO", () => {
            interaction = hPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 50, "left", {});

            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("with a VPan and minimal distance OK", () => {
            interaction = vPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 100, "top", {}, 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a VPan and minimal distance KO", () => {
            interaction = vPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 99, "bottom", {}, 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a LeftPan and minimal distance OK", () => {
            interaction = leftPan(logger, false, 1, 50)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 100, "left", {}, 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a LeftPan and minimal distance KO", () => {
            interaction = leftPan(logger, false, 1, 20)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 19, "left", {}, 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a RightPan and minimal distance OK", () => {
            interaction = rightPan(logger, false, 1, 1)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 100, "right", {}, 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a RightPan and minimal distance KO", () => {
            interaction = rightPan(logger, false, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 9, "right", {}, 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a TopPan and minimal distance OK", () => {
            interaction = topPan(logger, false, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 100, "top", {});

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a TopPan and minimal distance KO", () => {
            interaction = topPan(logger, false, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 9, "top", {});

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a BottomPan and minimal distance OK", () => {
            interaction = bottomPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 100, "bottom", {});

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a BottomPan and minimal distance KO", () => {
            interaction = bottomPan(logger, false, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .pan(2, 99, "bottom", {});

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });
});
