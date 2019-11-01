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

import { EventRegistrationToken } from "../../src/fsm/Events";
import { DnD } from "../../src/interaction/library/DnD";
import { FSMHandler } from "../../src/fsm/FSMHandler";
import { StubFSMHandler } from "../fsm/StubFSMHandler";
import { createKeyEvent, createMouseEvent } from "./StubEvents";

jest.mock("../fsm/StubFSMHandler");

let interaction: DnD;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new DnD(false, true);
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><canvas id='cv1'></canvas></html>";
    const elt = document.getElementById("cv1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("Test Press execution", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("Press escape key while press don't trigger the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas, undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "Escape"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("Press escape after moving cancel the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas, undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "Escape"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("Press escape after multiple move cancel the interaction.", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas, undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "Escape"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("Interaction restart after cancel", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "Escape"));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});
