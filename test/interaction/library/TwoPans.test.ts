/* eslint-disable jest/no-commented-out-tests */
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

import type {FSMHandler, Logger, TwoTouchDnD} from "../../../src/interacto";
import {twoBottomPan, twoHPan, twoLeftPan, twoRightPan, twoTopPan, twoVPan} from "../../../src/interacto";
import {robot} from "../StubEvents";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";

describe("using two pan interactions", () => {
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;
    let interaction: TwoTouchDnD;

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

    describe("using a horizontal two-pan interaction", () => {
        beforeEach(() => {
            interaction = twoHPan(logger, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        test("has a good name", () => {
            expect(interaction.name).toBe(twoHPan.name);
        });

        test("touch move horiz ok", () => {
            robot(canvas)
                .twoPan(1, 2, 10, "left");

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move vert ko", () => {
            robot(canvas)
                .twoPan(1, 2, 10, "top");

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move horiz ko because beyond tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 2, 10, "right", 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move horiz ok because in tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 2, 10, "left", 10);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a vertical two-pan interaction", () => {
        beforeEach(() => {
            interaction = twoVPan(logger, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("has a good name", () => {
            expect(interaction.name).toBe(twoVPan.name);
        });

        test("touch move vert ok", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top");

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move horiz ko", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "right");

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move vert ko because beyond tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top", 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move vert ok because in tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top", 9);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a left two-pan interaction", () => {
        beforeEach(() => {
            interaction = twoLeftPan(logger, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("has a good name", () => {
            expect(interaction.name).toBe(twoLeftPan.name);
        });

        test("touch move left ok", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "left");

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move left ko when to right", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "right");

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move left ko when to top beyond threshold", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "left", 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move left ok when to top too because in tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "left", 9);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a right two-pan interaction", () => {
        beforeEach(() => {
            interaction = twoRightPan(logger, 20)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move right ok", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "right");

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move right ko when to left", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "left");

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move right ko when to bottom beyond threshold", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "right", 21);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move right ok when to top too because in tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "right", 20);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a top two-pan interaction", () => {
        beforeEach(() => {
            interaction = twoTopPan(logger, 30)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move top ok", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top");

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move top ko when to bottom", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "bottom");

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move top ko when to right beyond threshold", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top", 31);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move top ok when to right too because in tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top", 30);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a bottom two-pan interaction", () => {
        beforeEach(() => {
            interaction = twoBottomPan(logger, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("touch move bottom ok", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "bottom");

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("touch move bottom ko when to top", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "top");

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move bottom ko when to right beyond threshold", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "bottom", 11);

            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("touch move bottom ok when to right too because in tolerance rate", () => {
            robot(canvas)
                .twoPan(1, 3, 10, "bottom", 10);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a pan interaction and a minimal distance", () => {
        test("with a HPan and minimal distance OK", () => {
            interaction = twoHPan(logger, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 100, "left", 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a HPan and minimal distance KO", () => {
            interaction = twoHPan(logger, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(2, 1, 99, "right", 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a VPan and minimal distance OK", () => {
            interaction = twoVPan(logger, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 100, "top", 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a VPan and minimal distance KO", () => {
            interaction = twoVPan(logger, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 99, "top", 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a LeftPan and minimal distance OK", () => {
            interaction = twoLeftPan(logger, 1, 50)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 100, "left", 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a LeftPan and minimal distance KO", () => {
            interaction = twoLeftPan(logger, 1, 20)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 19, "left", 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a RightPan and minimal distance OK", () => {
            interaction = twoRightPan(logger, 1, 2)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 2, "right", 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a RightPan and minimal distance KO", () => {
            interaction = twoRightPan(logger, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 1, "right", 1);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a TopPan and minimal distance OK", () => {
            interaction = twoTopPan(logger, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 10, "top", 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a TopPan and minimal distance KO", () => {
            interaction = twoTopPan(logger, 1, 10)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 2, "top", 9);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("with a BottomPan and minimal distance OK", () => {
            interaction = twoBottomPan(logger, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 100, "bottom", 1);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("with a BottomPan and minimal distance KO", () => {
            interaction = twoBottomPan(logger, 1, 100)();
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .twoPan(1, 3, 2, "bottom", 99);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });
});
