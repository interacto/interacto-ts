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

import {Click, FSMHandler} from "../../../src/interacto";
import {createMouseEvent, robot} from "../StubEvents";
import {mock, MockProxy} from "jest-mock-extended";

let interaction: Click;
let canvas: HTMLElement;
let handler: FSMHandler & MockProxy<FSMHandler>;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new Click();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
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

test("testClickData", () => {
    let x: number | undefined;
    let y: number | undefined;
    let sx: number | undefined;
    let sy: number | undefined;
    let button: number | undefined;

    handler.fsmStops.mockImplementation(() => {
        button = interaction.getData().getButton();
        x = interaction.getData().getSrcClientX();
        y = interaction.getData().getSrcClientY();
        sx = interaction.getData().getSrcScreenX();
        sy = interaction.getData().getSrcScreenY();
    });
    interaction.processEvent(createMouseEvent("click", canvas, 111, 222, 11, 22, 1));
    expect(x).toStrictEqual(11);
    expect(y).toStrictEqual(22);
    expect(sx).toStrictEqual(111);
    expect(sy).toStrictEqual(222);
    expect(button).toStrictEqual(1);
});

test("testClickOnWidgetData", () => {
    let x: number | undefined;
    let y: number | undefined;
    let sx: number | undefined;
    let sy: number | undefined;
    let button: number | undefined;

    handler.fsmStops.mockImplementation(() => {
        button = interaction.getData().getButton();
        x = interaction.getData().getSrcClientX();
        y = interaction.getData().getSrcClientY();
        sx = interaction.getData().getSrcScreenX();
        sy = interaction.getData().getSrcScreenY();
    });
    interaction.registerToNodes([canvas]);
    robot().click({"target": canvas, "button": 1, "screenX": 111, "screenY": 222, "clientX": 11, "clientY": 22});
    expect(x).toStrictEqual(11);
    expect(y).toStrictEqual(22);
    expect(sx).toStrictEqual(111);
    expect(sy).toStrictEqual(222);
    expect(button).toStrictEqual(1);
});

