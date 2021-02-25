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

import type {FSMHandler} from "../../../src/interacto";
import {MultiTouch} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";
import {TouchDataImpl} from "../../../src/impl/interaction/TouchDataImpl";
import {checkTouchPoint} from "../../Utils";

let interaction: MultiTouch;
let canvas: HTMLElement;
let handler: FSMHandler;


beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new MultiTouch(3);
    interaction.getFsm().addHandler(handler);
    canvas = document.createElement("canvas");
});

test("touch1", () => {
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 11, 23));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(1);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 data", () => {
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 11, 23, 11, 23));
    expect(interaction.getData().touches).toHaveLength(1);
    checkTouchPoint(interaction.getData().touches[0].src, 11, 23, 11, 23, 3, canvas);
    checkTouchPoint(interaction.getData().touches[0].tgt, 11, 23, 11, 23, 3, canvas);
});

test("touch2", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 11, 23));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(2);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch2 data", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 21, 13, 21, 13));
    expect(interaction.getData().touches).toHaveLength(2);
    checkTouchPoint(interaction.getData().touches[0].src, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(interaction.getData().touches[1].src, 21, 13, 21, 13, 2, canvas);
    checkTouchPoint(interaction.getData().touches[0].tgt, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(interaction.getData().touches[1].tgt, 21, 13, 21, 13, 2, canvas);
});

test("touch3", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(3);
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch3 data", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    expect(interaction.getData().touches).toHaveLength(3);
    checkTouchPoint(interaction.getData().touches[0].src, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(interaction.getData().touches[1].src, 21, 13, 21, 13, 3, canvas);
    checkTouchPoint(interaction.getData().touches[2].src, 210, 130, 210, 130, 2, canvas);
    checkTouchPoint(interaction.getData().touches[0].tgt, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(interaction.getData().touches[1].tgt, 21, 13, 21, 13, 3, canvas);
    checkTouchPoint(interaction.getData().touches[2].tgt, 210, 130, 210, 130, 2, canvas);
});

test("touch3 with one error event", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 210, 130, 210, 130));
    expect(interaction.getFsm().getConccurFSMs()
        .filter(fsm => fsm.isStarted())).toHaveLength(2);
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 move3", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 release2", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchend", 2, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 move2 touch3 move1 release2", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchmove", 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchend", 2, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 release1 touch4", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchend", 1, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchstart", 4, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch2 touch3 touch1 release3 touch3", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchend", 3, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 210, 130, 210, 130));
    expect(interaction.isRunning()).toBeTruthy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch1 touch2 touch3 move3 data", () => {
    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));
    interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 2100, 1300, 2100, 1300));
    expect(interaction.getData().touches).toHaveLength(3);
    checkTouchPoint(interaction.getData().touches[0].src, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(interaction.getData().touches[1].src, 21, 13, 21, 13, 3, canvas);
    checkTouchPoint(interaction.getData().touches[2].src, 210, 130, 210, 130, 2, canvas);
    checkTouchPoint(interaction.getData().touches[0].tgt, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(interaction.getData().touches[1].tgt, 2100, 1300, 2100, 1300, 3, canvas);
    checkTouchPoint(interaction.getData().touches[2].tgt, 210, 130, 210, 130, 2, canvas);
});

test("touch end", () => {
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchend", 2, canvas, 11, 23, 11, 23));
    expect(interaction.isRunning()).toBeFalsy();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

// eslint-disable-next-line jest/expect-expect
test("touch end data", () => {
    const data1s = new TouchDataImpl();
    const data1t = new TouchDataImpl();
    const data2s = new TouchDataImpl();
    const data2t = new TouchDataImpl();
    const data3s = new TouchDataImpl();
    const data3t = new TouchDataImpl();

    interaction.processEvent(createTouchEvent("touchstart", 1, canvas, 11, 23, 11, 23));
    interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 21, 13, 21, 13));
    interaction.processEvent(createTouchEvent("touchstart", 2, canvas, 210, 130, 210, 130));

    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        data1s.copy(interaction.getData().touches[0].src);
        data1t.copy(interaction.getData().touches[0].tgt);
        data2s.copy(interaction.getData().touches[1].src);
        data2t.copy(interaction.getData().touches[1].tgt);
        data3s.copy(interaction.getData().touches[2].src);
        data3t.copy(interaction.getData().touches[2].tgt);
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.processEvent(createTouchEvent("touchend", 2, canvas, 11, 23, 11, 23));

    checkTouchPoint(data1s, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(data1t, 11, 23, 11, 23, 1, canvas);
    checkTouchPoint(data2s, 21, 13, 21, 13, 3, canvas);
    checkTouchPoint(data2t, 21, 13, 21, 13, 3, canvas);
    checkTouchPoint(data3s, 210, 130, 210, 130, 2, canvas);
    checkTouchPoint(data3t, 11, 23, 11, 23, 2, canvas);
});
