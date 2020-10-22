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
import {createKeyEvent, createMouseEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: DnD;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new DnD(true);
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><canvas id='cv1'></canvas></html>";
    canvas = document.getElementById("cv1") as HTMLElement;
});

test("press execution", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("press escape key while press don't trigger the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "Escape"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("press escape after moving cancel the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "Escape"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("press escape after multiple move cancel the interaction.", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "Escape"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("interaction restart after cancel", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "Escape"));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});
