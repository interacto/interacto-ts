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

import { StubFSMHandler } from "../../fsm/StubFSMHandler";
import { Click } from "../../../src/interaction/library/Click";
import { EventRegistrationToken } from "../../../src/fsm/Events";
import { createMouseEvent } from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: Click;
let canvas: HTMLElement;
let handler: StubFSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new Click();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("click on a element starts and stops the interaction Click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("other event don't trigger the interaction.", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(new Event("input"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("press on a canvas then move don't starts the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("testClickData", () => {
    let x: number | undefined;
    let y: number | undefined;
    let sx: number | undefined;
    let sy: number | undefined;
    let button: number | undefined;

    handler.fsmStops = jest.fn(() => {
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

    handler.fsmStops = jest.fn(() => {
        button = interaction.getData().getButton();
        x = interaction.getData().getSrcClientX();
        y = interaction.getData().getSrcClientY();
        sx = interaction.getData().getSrcScreenX();
        sy = interaction.getData().getSrcScreenY();
    });
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent("click", canvas, 111, 222, 11, 22, 1));
    expect(x).toStrictEqual(11);
    expect(y).toStrictEqual(22);
    expect(sx).toStrictEqual(111);
    expect(sy).toStrictEqual(222);
    expect(button).toStrictEqual(1);
});
