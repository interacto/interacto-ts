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

import {EventRegistrationToken, FSMHandler, TouchDnD} from "../../../src/interacto";
import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {createTouchEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: TouchDnD;
let canvas: HTMLElement;
let handler: FSMHandler;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let data: any;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new TouchDnD();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    canvas = document.getElementById("canvas1") as HTMLElement;
});

test("pressure", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure data", () => {
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            data = {...interaction.getData()};
        }
    }());
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 15, 20, 16, 21));
    expect(data.srcClientX).toBe(16);
    expect(data.srcClientY).toBe(21);
    expect(data.srcScreenX).toBe(15);
    expect(data.srcScreenY).toBe(20);
    expect(data.tgtClientX).toBe(16);
    expect(data.tgtClientY).toBe(21);
    expect(data.tgtScreenX).toBe(15);
    expect(data.tgtScreenY).toBe(20);
    expect(data.touchID).toBe(3);
    expect(data.button).toBeUndefined();
    expect(data.tgtObject).toBe(canvas);
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
        public fsmUpdates(): void {
            data = {...interaction.getData()};
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 141, 24, 14, 28));
    expect(data.srcClientX).toBe(12);
    expect(data.srcClientY).toBe(25);
    expect(data.srcScreenX).toBe(11);
    expect(data.srcScreenY).toBe(23);
    expect(data.tgtClientX).toBe(14);
    expect(data.tgtClientY).toBe(28);
    expect(data.tgtScreenX).toBe(141);
    expect(data.tgtScreenY).toBe(24);
    expect(data.touchID).toBe(2);
    expect(data.button).toBeUndefined();
    expect(data.tgtObject).toBe(canvas);
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
        public fsmUpdates(): void {
            data = {...interaction.getData()};
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 4, canvas, 110, 240, 140, 280));
    expect(data.srcClientX).toBe(112);
    expect(data.srcClientY).toBe(215);
    expect(data.srcScreenX).toBe(111);
    expect(data.srcScreenY).toBe(213);
    expect(data.tgtClientX).toBe(140);
    expect(data.tgtClientY).toBe(280);
    expect(data.tgtScreenX).toBe(110);
    expect(data.tgtScreenY).toBe(240);
    expect(data.touchID).toBe(4);
    expect(data.button).toBeUndefined();
    expect(data.tgtObject).toBe(canvas);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data2: any;
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            data = {...interaction.getData()};
        }
        public fsmStops(): void {
            data2 = {...interaction.getData()};
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 0, canvas, 111, 231, 121, 251));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 0, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 0, canvas, 110, 240, 140, 280));

    expect(data.srcClientX).toBe(121);
    expect(data.srcClientY).toBe(251);
    expect(data.srcScreenX).toBe(111);
    expect(data.srcScreenY).toBe(231);
    expect(data.tgtClientX).toBe(14);
    expect(data.tgtClientY).toBe(28);
    expect(data.tgtScreenX).toBe(11);
    expect(data.tgtScreenY).toBe(24);
    expect(data.touchID).toBe(0);
    expect(data.button).toBeUndefined();
    expect(data.tgtObject).toBe(canvas);

    expect(data2.srcClientX).toBe(121);
    expect(data2.srcClientY).toBe(251);
    expect(data2.srcScreenX).toBe(111);
    expect(data2.srcScreenY).toBe(231);
    expect(data2.tgtClientX).toBe(140);
    expect(data2.tgtClientY).toBe(280);
    expect(data2.tgtScreenX).toBe(110);
    expect(data2.tgtScreenY).toBe(240);
    expect(data2.touchID).toBe(0);
    expect(data2.button).toBeUndefined();
    expect(data2.tgtObject).toBe(canvas);
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
