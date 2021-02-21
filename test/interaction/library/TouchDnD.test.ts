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

import {FSMHandler, TouchDnD} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";
import {TouchDataImpl} from "../../../src/impl/interaction/library/TouchDataImpl";

let interaction: TouchDnD;
let canvas: HTMLElement;
let handler: FSMHandler;
let srcData: TouchDataImpl;
let tgtData: TouchDataImpl;

beforeEach(() => {
    srcData = new TouchDataImpl();
    tgtData = new TouchDataImpl();
    handler = mock<FSMHandler>();
    interaction = new TouchDnD();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    canvas = document.createElement("canvas");
});

test("pressure", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure data", () => {
    const newHandler = mock<FSMHandler>();

    newHandler.fsmUpdates.mockImplementation(() => {
        srcData.copy(interaction.getData().src);
        tgtData.copy(interaction.getData().tgt);
    });
    interaction.getFsm().addHandler(newHandler);
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 16, 21));
    expect(srcData.clientX).toBe(16);
    expect(srcData.clientY).toBe(21);
    expect(srcData.screenX).toBe(15);
    expect(srcData.screenY).toBe(20);
    expect(tgtData.clientX).toBe(16);
    expect(tgtData.clientY).toBe(21);
    expect(tgtData.screenX).toBe(15);
    expect(tgtData.screenY).toBe(20);
    expect(srcData.identifier).toBe(3);
    expect(tgtData.identifier).toBe(3);
    expect(srcData.target).toBe(canvas);
    expect(srcData.currentTarget).toBeNull();
    expect(tgtData.target).toBe(canvas);
    expect(tgtData.currentTarget).toBeNull();
});

test("pressure release", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchend", 2, canvas, 11, 23, 12, 25));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 2, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move data", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 12, 25));
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        srcData.copy(interaction.getData().src);
        tgtData.copy(interaction.getData().tgt);
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.processEvent(createTouchEvent("touchmove", 2, canvas, 141, 24, 14, 28));
    expect(srcData.clientX).toBe(12);
    expect(srcData.clientY).toBe(25);
    expect(srcData.screenX).toBe(11);
    expect(srcData.screenY).toBe(23);
    expect(tgtData.clientX).toBe(14);
    expect(tgtData.clientY).toBe(28);
    expect(tgtData.screenX).toBe(141);
    expect(tgtData.screenY).toBe(24);
    expect(srcData.identifier).toBe(2);
    expect(tgtData.identifier).toBe(2);
    expect(srcData.target).toBe(canvas);
    expect(srcData.currentTarget).toBeNull();
    expect(tgtData.target).toBe(canvas);
    expect(tgtData.currentTarget).toBeNull();
});

test("pressure move move KO", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 2, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchmove", 1, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move OK", () => {
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move OK data", () => {
    interaction.processEvent(createTouchEvent("touchstart", 4, canvas, 111, 213, 112, 215));
    interaction.processEvent(createTouchEvent("touchmove", 4, canvas, 11, 24, 14, 28));

    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        srcData.copy(interaction.getData().src);
        tgtData.copy(interaction.getData().tgt);
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.processEvent(createTouchEvent("touchmove", 4, canvas, 110, 240, 140, 280));
    expect(srcData.clientX).toBe(112);
    expect(srcData.clientY).toBe(215);
    expect(srcData.screenX).toBe(111);
    expect(srcData.screenY).toBe(213);
    expect(tgtData.clientX).toBe(140);
    expect(tgtData.clientY).toBe(280);
    expect(tgtData.screenX).toBe(110);
    expect(tgtData.screenY).toBe(240);
    expect(srcData.identifier).toBe(4);
    expect(srcData.target).toBe(canvas);
    expect(srcData.currentTarget).toBeNull();
    expect(tgtData.target).toBe(canvas);
    expect(tgtData.currentTarget).toBeNull();
});

test("pressure move release", () => {
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchend", 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move release data", () => {
    const srcData2 = new TouchDataImpl();
    const tgtData2 = new TouchDataImpl();
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        srcData.copy(interaction.getData().src);
        tgtData.copy(interaction.getData().tgt);
    });
    newHandler.fsmStops.mockImplementation(() => {
        srcData2.copy(interaction.getData().src);
        tgtData2.copy(interaction.getData().tgt);
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.processEvent(createTouchEvent("touchstart", 0, canvas, 111, 231, 121, 251));
    interaction.processEvent(createTouchEvent("touchmove", 0, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchend", 0, canvas, 110, 240, 140, 280));

    expect(srcData.clientX).toBe(121);
    expect(srcData.clientY).toBe(251);
    expect(srcData.screenX).toBe(111);
    expect(srcData.screenY).toBe(231);
    expect(tgtData.clientX).toBe(14);
    expect(tgtData.clientY).toBe(28);
    expect(tgtData.screenX).toBe(11);
    expect(tgtData.screenY).toBe(24);
    expect(srcData.identifier).toBe(0);
    expect(tgtData.identifier).toBe(0);
    expect(srcData.target).toBe(canvas);
    expect(srcData.currentTarget).toBeNull();
    expect(tgtData.target).toBe(canvas);
    expect(tgtData.currentTarget).toBeNull();

    expect(srcData2.clientX).toBe(121);
    expect(srcData2.clientY).toBe(251);
    expect(srcData2.screenX).toBe(111);
    expect(srcData2.screenY).toBe(231);
    expect(tgtData2.clientX).toBe(140);
    expect(tgtData2.clientY).toBe(280);
    expect(tgtData2.screenX).toBe(110);
    expect(tgtData2.screenY).toBe(240);
    expect(srcData2.identifier).toBe(0);
    expect(tgtData2.identifier).toBe(0);
    expect(srcData2.target).toBe(canvas);
    expect(tgtData2.target).toBe(canvas);
});

test("pressure move release KO", () => {
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchend", 2, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("pressure move move release", () => {
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchend", 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch on registered widget", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchend", 3, canvas, 171, 274, 174, 278));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch restart", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    interaction.processEvent(createTouchEvent("touchend", 3, canvas, 171, 274, 174, 278));
    canvas.dispatchEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25));
    canvas.dispatchEvent(createTouchEvent("touchmove", 3, canvas, 11, 24, 14, 28));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("no modifiers and button", () => {
    expect(interaction.getData().src.altKey).toBeFalsy();
    expect(interaction.getData().src.ctrlKey).toBeFalsy();
    expect(interaction.getData().src.metaKey).toBeFalsy();
    expect(interaction.getData().src.shiftKey).toBeFalsy();
});
