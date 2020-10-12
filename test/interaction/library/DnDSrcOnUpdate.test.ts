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

import {DnD, EventRegistrationToken, FSMHandler} from "../../../src/interacto";
import {createMouseEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: DnD;
let canvas: HTMLElement;
let handler: FSMHandler;
let tx: number | undefined;
let ty: number | undefined;
let sx: number | undefined;
let sy: number | undefined;
let button: number | undefined;
let obj: HTMLCanvasElement | undefined;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new DnD(true, false);
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><canvas id='cav1'></canvas></html>";
    canvas = document.getElementById("cav1") as HTMLElement;
});

test("press event don't trigger the interaction DnD", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("check data press move", () => {
    interaction.registerToNodes([canvas]);
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStarts.mockImplementation(() => {
        sx = interaction.getData().getSrcClientX();
        sy = interaction.getData().getSrcClientY();
        tx = interaction.getData().getTgtClientX();
        ty = interaction.getData().getTgtClientY();
        button = interaction.getData().getButton();
        obj = interaction.getData().getTgtObject() as HTMLCanvasElement;
    });
    interaction.getFsm().addHandler(newHandler);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 110, 230));
    expect(sx).toBe(11);
    expect(sy).toBe(23);
    expect(tx).toBe(110);
    expect(ty).toBe(230);
    expect(button).toBe(0);
    expect(obj).toBe(canvas);
});

test("click and move and release start and update the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("data of the press and drag part of the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, undefined, undefined, 15, 20, 0));
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        sx = interaction.getData().getSrcClientX();
        sy = interaction.getData().getSrcClientY();
        tx = interaction.getData().getTgtClientX();
        ty = interaction.getData().getTgtClientY();
        button = interaction.getData().getButton();
        obj = interaction.getData().getTgtObject() as HTMLCanvasElement;
    });
    interaction.getFsm().addHandler(newHandler);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 16, 21));
    expect(sx).toBe(15);
    expect(sy).toBe(20);
    expect(tx).toBe(16);
    expect(ty).toBe(21);
    expect(button).toBe(0);
    expect(obj).toBe(canvas);
});

test("check data with multiple drag", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, undefined, undefined, 11, 23, 0));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 12, 22, 0));
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        sx = interaction.getData().getSrcClientX();
        sy = interaction.getData().getSrcClientY();
        tx = interaction.getData().getTgtClientX();
        ty = interaction.getData().getTgtClientY();
        button = interaction.getData().getButton();
        obj = interaction.getData().getTgtObject() as HTMLCanvasElement;
    });
    interaction.getFsm().addHandler(newHandler);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 12, 24, 0));
    expect(sx).toBe(12);
    expect(sy).toBe(22);
    expect(tx).toBe(12);
    expect(ty).toBe(24);
    expect(button).toBe(0);
});
