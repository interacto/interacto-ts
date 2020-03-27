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

import { FSMHandler } from "../../../src/fsm/FSMHandler";
import { StubFSMHandler } from "../../fsm/StubFSMHandler";
import { EventRegistrationToken } from "../../../src/fsm/Events";
import { createTouchEvent } from "../StubEvents";
import { TouchDnD } from "../../../src/interaction/library/TouchDnD";

jest.mock("../../fsm/StubFSMHandler");

let interaction: TouchDnD;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new TouchDnD();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("pressure", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure data", () => {
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }
        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(15);
            expect(interaction.getData().getSrcClientY()).toBe(20);
            expect(interaction.getData().getSrcScreenX()).toBe(16);
            expect(interaction.getData().getSrcScreenY()).toBe(21);
            expect(interaction.getData().getTgtClientX()).toBe(15);
            expect(interaction.getData().getTgtClientY()).toBe(20);
            expect(interaction.getData().getTgtScreenX()).toBe(16);
            expect(interaction.getData().getTgtScreenY()).toBe(21);
            expect(interaction.getData().getTouchId()).toBe(3);
            expect(interaction.getData().getButton()).toBeUndefined();
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
    }());
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 15, 20, 16, 21));
});

test("pressure release", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas, 11, 23, 12, 25));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }
        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(11);
            expect(interaction.getData().getSrcClientY()).toBe(23);
            expect(interaction.getData().getSrcScreenX()).toBe(12);
            expect(interaction.getData().getSrcScreenY()).toBe(25);
            expect(interaction.getData().getTgtClientX()).toBe(141);
            expect(interaction.getData().getTgtClientY()).toBe(25);
            expect(interaction.getData().getTgtScreenX()).toBe(14);
            expect(interaction.getData().getTgtScreenY()).toBe(28);
            expect(interaction.getData().getTouchId()).toBe(2);
            expect(interaction.getData().getButton()).toBeUndefined();
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 141, 24, 14, 28));
});

test("pressure move move KO", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 1, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move OK", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move OK data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas, 111, 213, 112, 215));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 4, canvas, 11, 24, 14, 28));

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }
        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(111);
            expect(interaction.getData().getSrcClientY()).toBe(213);
            expect(interaction.getData().getSrcScreenX()).toBe(112);
            expect(interaction.getData().getSrcScreenY()).toBe(215);
            expect(interaction.getData().getTgtClientX()).toBe(110);
            expect(interaction.getData().getTgtClientY()).toBe(240);
            expect(interaction.getData().getTgtScreenX()).toBe(140);
            expect(interaction.getData().getTgtScreenY()).toBe(280);
            expect(interaction.getData().getTouchId()).toBe(4);
            expect(interaction.getData().getButton()).toBeUndefined();
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 4, canvas, 110, 240, 140, 280));
});

test("pressure move release", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move release data", () => {
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }
        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(111);
            expect(interaction.getData().getSrcClientY()).toBe(231);
            expect(interaction.getData().getSrcScreenX()).toBe(121);
            expect(interaction.getData().getSrcScreenY()).toBe(251);
            expect(interaction.getData().getTgtClientX()).toBe(110);
            expect(interaction.getData().getTgtClientY()).toBe(240);
            expect(interaction.getData().getTgtScreenX()).toBe(140);
            expect(interaction.getData().getTgtScreenY()).toBe(280);
            expect(interaction.getData().getTouchId()).toBe(0);
            expect(interaction.getData().getButton()).toBeUndefined();
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 0, canvas, 111, 231, 121, 251));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 0, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 0, canvas, 110, 240, 140, 280));
});

test("pressure move release KO", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move release", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move release data", () => {
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }
        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(11);
            expect(interaction.getData().getSrcClientY()).toBe(23);
            expect(interaction.getData().getSrcScreenX()).toBe(12);
            expect(interaction.getData().getSrcScreenY()).toBe(25);
            expect(interaction.getData().getTgtClientX()).toBe(171);
            expect(interaction.getData().getTgtClientY()).toBe(274);
            expect(interaction.getData().getTgtScreenX()).toBe(174);
            expect(interaction.getData().getTgtScreenY()).toBe(278);
            expect(interaction.getData().getTouchId()).toBe(0);
            expect(interaction.getData().getButton()).toBeUndefined();
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
        public fsmStops(): void {
            expect(interaction.getData().getSrcClientX()).toBe(11);
            expect(interaction.getData().getSrcClientY()).toBe(23);
            expect(interaction.getData().getSrcScreenX()).toBe(12);
            expect(interaction.getData().getSrcScreenY()).toBe(25);
            expect(interaction.getData().getTgtClientX()).toBe(171);
            expect(interaction.getData().getTgtClientY()).toBe(274);
            expect(interaction.getData().getTgtScreenX()).toBe(174);
            expect(interaction.getData().getTgtScreenY()).toBe(278);
            expect(interaction.getData().getTouchId()).toBe(0);
            expect(interaction.getData().getButton()).toBeUndefined();
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 171, 274, 174, 278));
});

test("touch on registered widget", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 171, 274, 174, 278));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch on unregistered widget", () => {
    interaction.registerToNodes([canvas]);
    interaction.unregisterFromNodes([canvas]);
    canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch restart", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 171, 274, 174, 278));
    canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
    canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("no modifiers and button", () => {
    expect(interaction.getData().isAltPressed()).toBeFalsy();
    expect(interaction.getData().isCtrlPressed()).toBeFalsy();
    expect(interaction.getData().isMetaPressed()).toBeFalsy();
    expect(interaction.getData().isShiftPressed()).toBeFalsy();
    expect(interaction.getData().getButton()).toBeUndefined();
});
