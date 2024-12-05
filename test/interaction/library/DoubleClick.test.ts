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

import {DoubleClick, PointDataImpl} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a double click interaction", () => {
    let interaction: DoubleClick;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        jest.useFakeTimers();
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        canvas = document.createElement("canvas");
    });

    describe("using a std double click", () => {
        beforeEach(() => {
            interaction = new DoubleClick(logger);
            interaction.fsm.addHandler(handler);
        });

        test("double click on a canvas starts and stops the interaction", () => {
            interaction.registerToNodes([canvas]);
            robot().click(canvas, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("log interaction is ok", () => {
            interaction.log(true);
            interaction.registerToNodes([canvas]);
            robot().click(canvas, 2, false);

            expect(logger.logInteractionMsg).toHaveBeenCalledTimes(12);
        });

        test("no log interaction is ok", () => {
            interaction.registerToNodes([canvas]);
            robot().click(canvas, 2, false);

            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
        });

        test("check data of the interaction.", () => {
            const data = new PointDataImpl();

            interaction.registerToNodes([canvas]);
            const newHandler = mock<FSMHandler>();
            newHandler.fsmStops = jest.fn(() => {
                data.copy(interaction.data);
            });
            interaction.fsm.addHandler(newHandler);
            robot(canvas)
                .click({"clientX": 11, "clientY": 23}, 2, false);

            expect(data.clientX).toBe(11);
            expect(data.clientY).toBe(23);
            expect(data.button).toBe(0);
            expect(data.currentTarget).toBe(canvas);
        });

        test("check data cleared", () => {
            interaction.registerToNodes([canvas]);
            const newHandler = mock<FSMHandler>();
            interaction.fsm.addHandler(newHandler);
            robot(canvas)
                .click({"clientX": 11, "clientY": 23}, 2, false);

            expect(newHandler.fsmReinit).toHaveBeenCalledTimes(1);
            expect(interaction.data.clientX).toBe(0);
            expect(interaction.data.clientY).toBe(0);
            expect(interaction.data.button).toBe(0);
            expect(interaction.data.currentTarget).toBeNull();
        });

        test("that two double clicks ok", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .runAllTimers()
                .click(canvas, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        });

        test("move between clicks does nothing without the tolerance rate", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click(undefined, 1, false)
                .mousemove()
                .click(undefined, 1, false);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("timout cancels the double click", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click()
                .runOnlyPendingTimers()
                .click();
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("double click with two different mouse button for each click don't start the interaction", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"button": 0}, 1, false)
                .click({"button": 2}, 1, false);
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("check if the interaction is recycled after a cancel", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click(undefined, 1, false)
                .mousemove()
                .click(canvas, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("check if the interaction work fine with bad move", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 1, false)
                .mousemove({"button": 1})
                .click(undefined, 1, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("specific mouse button checking OK", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"button": 2}, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("dble Click OK After Delay", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"button": 2}, 1, false)
                .runOnlyPendingTimers()
                .click({"button": 1}, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });
    });

    describe("using a double click with a tolerance rate", () => {
        beforeEach(() => {
            interaction = new DoubleClick(logger, undefined, undefined, undefined, 20);
            interaction.fsm.addHandler(handler);
        });

        test("double click on a canvas starts and stops the interaction with a tolerance rate", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas).click({"clientX": 10, "clientY": 20, "button": 2}, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("double click on a canvas fails, because first click moves", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .mousedown({"clientX": 10, "clientY": 20, "button": 2})
                .mousemove({"clientX": -11, "clientY": 20, "button": 2})
                .mouseup({"clientX": -11, "clientY": 20, "button": 2})
                .click({"clientX": -11, "clientY": 20, "button": 2}, 1, false);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("double click on a canvas fails, because second click moves", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"clientX": 0, "clientY": -20, "button": 2}, 1, false)
                .mousedown({"clientX": 0, "clientY": -20, "button": 2})
                .mousemove({"clientX": 0, "clientY": 1, "button": 2})
                .mouseup({"clientX": 0, "clientY": 1, "button": 2});

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("double click KO when moving between clicks beyond tolerance rate", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"clientX": 0, "clientY": -20, "button": 2}, 1, false)
                .mousemove({"clientX": 21, "clientY": -20, "button": 2})
                .click({"clientX": 19, "clientY": -20, "button": 2}, 1, false);

            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("double click OK when moving between clicks under tolerance rate", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"clientX": 0, "clientY": -20, "button": 2}, 1, false)
                .mousemove({"clientX": 19, "clientY": -20, "button": 2})
                .click({"clientX": 19, "clientY": -20, "button": 2}, 1, false);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });
    });
});
