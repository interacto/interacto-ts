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

import {PointDataImpl, MouseMove} from "../../../src/interacto";
import {createMouseEvent, createMouseEvent2} from "../StubEvents";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a mouse move interaction", () => {
    let interaction: MouseMove;
    let canvas: HTMLElement;
    let handler: FSMHandler & MockProxy<FSMHandler>;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new MouseMove(logger);
        interaction.fsm.addHandler(handler);

        canvas = document.createElement("canvas");
    });

    test("mousemove sent to the interaction starts and stops the MouseMove interaction", () => {
        interaction.registerToNodes([canvas]);

        const evt = createMouseEvent("mousemove",
            canvas, 11, 43, 12, 11, 1);
        interaction.processEvent(evt);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([canvas]);

        const evt = createMouseEvent("mousemove",
            canvas, 11, 43, 12, 11, 1);
        interaction.processEvent(evt);

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([canvas]);

        const evt = createMouseEvent("mousemove",
            canvas, 11, 43, 12, 11, 1);
        interaction.processEvent(evt);

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("mousemove on an element starts and stops the MouseMove interaction", () => {
        interaction.registerToNodes([canvas]);

        const evt = createMouseEvent("mousemove",
            canvas, 11, 43, 12, 11, 1);
        canvas.dispatchEvent(evt);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("other events don't trigger the interaction.", () => {
        interaction.registerToNodes([canvas]);
        robot().input(canvas);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("mouse Event Data", () => {
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
        interaction.processEvent(createMouseEvent2("mousemove", expected));
        expect(data).toStrictEqual(expected);
    });

    test("mouse move On Widget Data", () => {
        const data = new PointDataImpl();

        handler.fsmStops = jest.fn(() => {
            data.copy(interaction.data);
        });
        interaction.registerToNodes([canvas]);
        canvas.dispatchEvent(new MouseEvent("mousemove", {"screenX": 111, "screenY": 222, "clientX": 11, "clientY": 22}));
        expect(data.clientX).toBe(11);
        expect(data.clientY).toBe(22);
        expect(data.screenX).toBe(111);
        expect(data.screenY).toBe(222);
    });

    test("data clear ok", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas).mousemove({"screenX": 111, "screenY": 222, "clientX": 11, "clientY": 22});

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.currentTarget).toBeNull();
        expect(interaction.data.clientX).toBe(0);
        expect(interaction.data.screenX).toBe(0);
    });
});
