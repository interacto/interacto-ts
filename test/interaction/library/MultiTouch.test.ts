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

import {EventRegistrationToken, FSMHandler, MultiTouch} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: MultiTouch;
let canvas: HTMLElement;
let handler: FSMHandler;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkSrcTouchPoint(data: any, lx: number, ly: number, sx: number, sy: number, id: number, o: EventTarget): void {
    expect(data.srcClientX).toStrictEqual(lx);
    expect(data.srcClientY).toStrictEqual(ly);
    expect(data.srcScreenX).toStrictEqual(sx);
    expect(data.srcScreenY).toStrictEqual(sy);
    expect(data.button).toBeUndefined();
    expect(data.touchID).toStrictEqual(id);
    expect(data.srcObject).toBe(o);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkTgtTouchPoint(data: any, lx: number, ly: number, sx: number, sy: number, id: number, o: EventTarget): void {
    expect(data.tgtClientX).toStrictEqual(lx);
    expect(data.tgtClientY).toStrictEqual(ly);
    expect(data.tgtScreenX).toStrictEqual(sx);
    expect(data.tgtScreenY).toStrictEqual(sy);
    expect(data.button).toBeUndefined();
    expect(data.touchID).toStrictEqual(id);
    expect(data.tgtObject).toBe(o);
}

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new MultiTouch(3);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    canvas = document.getElementById("canvas1") as HTMLElement;
});

test("touch1", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 11, 23, 11, 23));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(1);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 11, 23, 11, 23));
    expect(interaction.getData().getTouchData()).toHaveLength(1);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 3, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 3, canvas);
});

test("touch2", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 11, 23, 11, 23));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(2);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch2 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 21, 13, 21, 13));
    expect(interaction.getData().getTouchData()).toHaveLength(2);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 2, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 2, canvas);
});

test("touch3", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 210, 130, 210, 130));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(3);
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch3 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 210, 130, 210, 130));
    expect(interaction.getData().getTouchData()).toHaveLength(3);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 3, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 3, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
});

test("touch3 with one error event", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 210, 130, 210, 130));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(2);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 move3", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 move3 data", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, canvas, 2100, 1300, 2100, 1300));
    expect(interaction.getData().getTouchData()).toHaveLength(3);
    checkSrcTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[1], 21, 13, 21, 13, 3, canvas);
    checkSrcTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[0], 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[1], 2100, 1300, 2100, 1300, 3, canvas);
    checkTgtTouchPoint(interaction.getData().getTouchData()[2], 210, 130, 210, 130, 2, canvas);
});

test("touch end", () => {
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchend, 2, canvas, 11, 23, 11, 23));
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

// eslint-disable-next-line jest/expect-expect
test("touch end data", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data1: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data2: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data3: any;

    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 210, 130, 210, 130));

    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        data1 = {...interaction.getData().getTouchData()[0]};
        data2 = {...interaction.getData().getTouchData()[1]};
        data3 = {...interaction.getData().getTouchData()[2]};
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.processEvent(createTouchEvent(EventRegistrationToken.touchend, 2, canvas, 11, 23, 11, 23));

    checkSrcTouchPoint(data1, 11, 23, 11, 23, 1, canvas);
    checkTgtTouchPoint(data1, 11, 23, 11, 23, 1, canvas);
    checkSrcTouchPoint(data2, 21, 13, 21, 13, 3, canvas);
    checkTgtTouchPoint(data2, 21, 13, 21, 13, 3, canvas);
    checkSrcTouchPoint(data3, 210, 130, 210, 130, 2, canvas);
    checkTgtTouchPoint(data3, 11, 23, 11, 23, 2, canvas);
});
