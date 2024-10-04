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

import {PointDataImpl, TimedClick} from "../../../src/interacto";
import {createMouseEvent2, robot} from "../StubEvents";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a timed click interaction", () => {
    let interaction: TimedClick;
    let canvas: HTMLElement;
    let handler: FSMHandler & MockProxy<FSMHandler>;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new TimedClick(300, logger);
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test("click on a element starts and stops the interaction TimedClick", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mouseup();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mouseup();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(7);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([canvas]);
        canvas.click();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("other event don't trigger the interaction.", () => {
        interaction.registerToNodes([canvas]);
        robot().input(canvas);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("press on a canvas then move don't starts the interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove();
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("specific mouse button checking OK", () => {
        interaction.registerToNodes([canvas]);
        robot()
            .mousedown({"target": canvas, "button": 2})
            .mouseup({"target": canvas, "button": 2});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("click Data", () => {
        interaction.registerToNodes([canvas]);

        const data = new PointDataImpl();
        const expected = new PointDataImpl();
        expected.copy({
            "altKey": true,
            "button": 1,
            "buttons": 0,
            "clientX": 11,
            "clientY": 22,
            "ctrlKey": false,
            "currentTarget": canvas,
            "metaKey": true,
            "movementX": 10,
            "movementY": 20,
            "offsetX": 30,
            "offsetY": 40,
            "pageX": 50,
            "pageY": 60,
            "relatedTarget": canvas,
            "screenX": 111,
            "screenY": 222,
            "shiftKey": true,
            "target": canvas,
            "timeStamp": 0
        });

        handler.fsmStops = jest.fn(() => {
            data.copy(interaction.data);
        });

        interaction.processEvent(createMouseEvent2("mousedown", expected));
        interaction.processEvent(createMouseEvent2("mouseup", expected));
        expect(data).toStrictEqual(expected);
    });

    test("click On Widget Data", () => {
        const data = new PointDataImpl();

        handler.fsmStops = jest.fn(() => {
            data.copy(interaction.data);
        });
        interaction.registerToNodes([canvas]);
        robot()
            .keepData()
            .mousedown({"target": canvas, "button": 1, "screenX": 111, "screenY": 222, "clientX": 11, "clientY": 22})
            .mouseup();
        expect(data.clientX).toBe(11);
        expect(data.clientY).toBe(22);
        expect(data.screenX).toBe(111);
        expect(data.screenY).toBe(222);
        expect(data.button).toBe(1);
    });

    test("move cancels", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mouseup();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("timeout cancels", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .runOnlyPendingTimers()
            .mouseup();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("timeout duration ok", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .do(() => {
                jest.advanceTimersByTime(295);
            })
            .mouseup();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("predefined mouse button checking OK", () => {
        interaction = new TimedClick(100, logger, 4);
        interaction.registerToNodes([canvas]);
        interaction.fsm.addHandler(handler);
        robot()
            .mousedown({"target": canvas, "button": 4})
            .mouseup({"target": canvas, "button": 4});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("predefined mouse button checking KO", () => {
        interaction = new TimedClick(100, logger, 4);
        interaction.registerToNodes([canvas]);
        interaction.fsm.addHandler(handler);
        robot()
            .mousedown({"target": canvas, "button": 3})
            .mouseup({"target": canvas, "button": 3});
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("restart ok", () => {
        interaction.registerToNodes([canvas]);
        robot()
            .mousedown({"target": canvas, "button": 3})
            .mouseup({"target": canvas, "button": 3})
            .mousedown({"target": canvas, "button": 2})
            .mouseup({"target": canvas, "button": 2});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
    });

    test("clear Data", () => {
        interaction.registerToNodes([canvas]);
        robot()
            .mousedown({"target": canvas, "button": 2})
            .mouseup({"target": canvas, "button": 2});
        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.clientX).toBe(0);
        expect(interaction.data.clientY).toBe(0);
        expect(interaction.data.button).toBe(0);
        expect(interaction.data.currentTarget).toBeNull();
    });
});
