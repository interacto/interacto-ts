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

import { FSMHandler } from "../../src/fsm/FSMHandler";
import { StubFSMHandler } from "../fsm/StubFSMHandler";
import { DragLock } from "../../src/interaction/library/DragLock";
import { createKeyEvent, createMouseEvent } from "./StubEvents";
import { EventRegistrationToken, KeyCode } from "../../src/fsm/Events";

jest.mock("../fsm/StubFSMHandler");

let interaction: DragLock;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    handler = new StubFSMHandler();
    interaction = new DragLock();
    interaction.log(true);
    // interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("drag lock is ok", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.click();
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("drag lock requires a least a move", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    canvas.click();
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("drag lock canceled on ESC", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, String(KeyCode.ESCAPE)));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("check data with a normal execution", () => {
    let srcX = -1;
    let srcY = -1;
    let tgtX = -1;
    let tgtY = -1;
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmStops(): void {
            srcX = interaction.getData().getSrcClientX();
            srcY = interaction.getData().getSrcClientY();
            tgtX = interaction.getData().getTgtClientX();
            tgtY = interaction.getData().getTgtClientY();
        }
    }());
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 22, 33));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 22, 33));
    expect(srcX).toBe(11);
    expect(srcY).toBe(23);
    expect(tgtX).toBe(22);
    expect(tgtY).toBe(33);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("check update work during move", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("check data update during a move", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11, 23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11, 23));
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            expect(interaction.getData().getTgtClientX()).toBe(30);
            expect(interaction.getData().getTgtClientY()).toBe(40);
        }
    }());
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 30, 40));
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("check data reinitialisation", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.click();
    canvas.click();
    expect(interaction.getData().getSrcClientX()).toBe(0);
    expect(interaction.getData().getSrcClientY()).toBe(0);
    expect(interaction.getData().getTgtClientX()).toBe(0);
    expect(interaction.getData().getTgtClientY()).toBe(0);
});

test("check if canceled with Esc after a move", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "Escape"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("check if the last DoubleClick with a different button don't stop the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11, 23, 1));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11, 23, 1));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 20, 30, 1));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 20, 30, 0));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 20, 30, 0));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});
