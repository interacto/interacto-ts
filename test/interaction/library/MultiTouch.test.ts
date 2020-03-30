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

import { EventRegistrationToken } from "../../../src/fsm/Events";
import { FSMHandler } from "../../../src/fsm/FSMHandler";
import { MultiTouch } from "../../../src/interaction/library/MultiTouch";
import { StubFSMHandler } from "../../fsm/StubFSMHandler";
import { createTouchEvent } from "../StubEvents";
import { TouchData } from "../../../src/interaction/library/TouchData";

jest.mock("../../fsm/StubFSMHandler");

let interaction: MultiTouch;
let canvas: HTMLElement;
let handler: FSMHandler;

function checkSrcTouchPoint(data: TouchData, lx: number, ly: number, sx: number, sy: number, id: number, o: EventTarget): void {
    expect(data.getSrcClientX()).toStrictEqual(lx);
    expect(data.getSrcClientY()).toStrictEqual(ly);
    expect(data.getSrcScreenX()).toStrictEqual(sx);
    expect(data.getSrcScreenY()).toStrictEqual(sy);
    expect(data.getButton()).toBeUndefined();
    expect(data.getTouchId()).toStrictEqual(id);
    expect(data.getSrcObject()).toBe(o);
}

function checkTgtTouchPoint(data: TouchData, lx: number, ly: number, sx: number, sy: number, id: number, o: EventTarget): void {
    expect(data.getTgtClientX()).toStrictEqual(lx);
    expect(data.getTgtClientY()).toStrictEqual(ly);
    expect(data.getTgtScreenX()).toStrictEqual(sx);
    expect(data.getTgtScreenY()).toStrictEqual(sy);
    expect(data.getButton()).toBeUndefined();
    expect(data.getTouchId()).toStrictEqual(id);
    expect(data.getTgtObject()).toBe(o);
}

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new MultiTouch(3);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("touch1", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 11, 23));
    expect(interaction.getFsm().getConccurFSMs().filter(fsm => fsm.isStarted())).toHaveLength(1);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 11, 23));
    expect(interaction.getData().getTouchData()).toHaveLength(1);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 3, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 3, canvas);
});

test("touch2", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 11, 23));
    expect(interaction.getFsm().getConccurFSMs().filter(fsm => fsm.isStarted())).toHaveLength(2);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch2 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 21, 13, 21, 13));
    expect(interaction.getData().getTouchData()).toHaveLength(2);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 2, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 2, canvas);
});

test("touch3", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 210, 130, 210, 130));
    expect(interaction.getFsm().getConccurFSMs().filter(fsm => fsm.isStarted())).toHaveLength(3);
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch3 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 210, 130, 210, 130));
    expect(interaction.getData().getTouchData()).toHaveLength(3);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 3, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 3, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
});

test("touch3 with one error event", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 210, 130, 210, 130));
    expect(interaction.getFsm().getConccurFSMs().filter(fsm => fsm.isStarted())).toHaveLength(2);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 move3", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 move3 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 2100, 1300, 2100, 1300));
    expect(interaction.getData().getTouchData()).toHaveLength(3);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 3, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[1], 2100, 1300, 2100, 1300, 3, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
});

test("touch end", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas, 11, 23, 11, 23));
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch end data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 210, 130, 210, 130));

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }
        public fsmStops(): void {
            checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
            checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);

            checkSrcTouchPoint(interaction.getData().getTouchData()[1], 110, 230, 110, 230, 2, canvas);
            checkTgtTouchPoint(interaction.getData().getTouchData()[1], 11, 23, 11, 23, 2, canvas);

            checkSrcTouchPoint(interaction.getData().getTouchData()[2], 111, 231, 111, 231, 3, canvas);
            checkTgtTouchPoint(interaction.getData().getTouchData()[2], 111, 231, 111, 231, 3, canvas);
        }
    }());

    interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas, 11, 23, 11, 23));
});
