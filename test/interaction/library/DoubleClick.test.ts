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

import {DoubleClick, FSMHandler} from "../../../src/interacto";
import {createMouseEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: DoubleClick;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new DoubleClick();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    canvas = document.createElement("canvas");
});

test("double click on a canvas starts and stops the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("check data of the interaction.", () => {
    let sx: number | undefined;
    let sy: number | undefined;
    let button: number | undefined;
    let obj: HTMLCanvasElement | undefined;

    interaction.registerToNodes([canvas]);
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        sx = interaction.getData().getSrcClientX();
        sy = interaction.getData().getSrcClientY();
        button = interaction.getData().getButton();
        obj = interaction.getData().getSrcObject() as HTMLCanvasElement;
    });
    interaction.getFsm().addHandler(newHandler);
    canvas.dispatchEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23));
    expect(sx).toBe(11);
    expect(sy).toBe(23);
    expect(button).toBe(0);
    expect(obj).toBe(canvas);
});

test("move between clicks cancels the double click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.dispatchEvent(createMouseEvent("mousemove", canvas));
    canvas.click();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("timout cancels the double click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    jest.runOnlyPendingTimers();
    canvas.click();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("double click with two different mouse button for each click don't start the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent("click", canvas, undefined, undefined,
        undefined, undefined, 0));
    canvas.dispatchEvent(createMouseEvent("click", canvas, undefined, undefined,
        undefined, undefined, 2));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("check if the interaction is recycled after a cancel", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.dispatchEvent(createMouseEvent("mousemove", canvas));
    canvas.click();
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("check if the interaction work fine with bad move", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.dispatchEvent(createMouseEvent("mousemove", canvas, undefined, undefined, undefined,
        undefined, 1));
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("specific mouse button checking OK", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent("auxclick", canvas, 111, 222, 11, 22, 2));
    canvas.dispatchEvent(createMouseEvent("auxclick", canvas, 111, 222, 11, 22, 2));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("dble Click OK After Delay", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent("auxclick", canvas, 111, 222, 11, 22, 2));
    jest.runOnlyPendingTimers();
    canvas.dispatchEvent(createMouseEvent("click", canvas, 111, 222, 11, 22, 1));
    canvas.dispatchEvent(createMouseEvent("click", canvas, 111, 222, 11, 22, 1));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
