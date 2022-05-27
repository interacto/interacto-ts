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

import type {FSMHandler} from "../../../src/interacto";
import {Click, PointDataImpl} from "../../../src/interacto";
import {createMouseEvent2} from "../StubEvents";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: Click;
let canvas: HTMLElement;
let handler: FSMHandler & MockProxy<FSMHandler>;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new Click();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    canvas = document.createElement("canvas");
});

test("click on a element starts and stops the interaction Click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
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
    robot().auxclick({"target": canvas, "button": 2});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("click Data", () => {
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
    interaction.processEvent(createMouseEvent2("click", expected));
    expect(data).toStrictEqual(expected);
});

test("click On Widget Data", () => {
    const data = new PointDataImpl();

    handler.fsmStops = jest.fn(() => {
        data.copy(interaction.data);
    });
    interaction.registerToNodes([canvas]);
    robot().click({"target": canvas, "button": 1, "screenX": 111, "screenY": 222, "clientX": 11, "clientY": 22});
    expect(data.clientX).toBe(11);
    expect(data.clientY).toBe(22);
    expect(data.screenX).toBe(111);
    expect(data.screenY).toBe(222);
    expect(data.button).toBe(1);
});

