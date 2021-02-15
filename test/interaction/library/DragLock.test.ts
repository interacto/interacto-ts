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

import {DragLock, FSMHandler} from "../../../src/interacto";
import {createMouseEvent, robot} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: DragLock;
let canvas: HTMLElement;
let handler: FSMHandler;
let tx: number | undefined;
let ty: number | undefined;
let sx: number | undefined;
let sy: number | undefined;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new DragLock();
    interaction.log(true);
    interaction.getFsm().addHandler(handler);
    canvas = document.createElement("canvas");
});

test("drag lock is ok", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .mousemove()
        .click()
        .click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("drag lock requires a least a move", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .click()
        .click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("drag lock canceled on ESC", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .keydown({"code": "27"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("check data with a normal execution", () => {
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        sx = interaction.getData().getSrcClientX();
        sy = interaction.getData().getSrcClientY();
        tx = interaction.getData().getTgtClientX();
        ty = interaction.getData().getTgtClientY();
    });
    interaction.getFsm().addHandler(newHandler);
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 22, 33));
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 22, 33));
    expect(sx).toBe(11);
    expect(sy).toBe(23);
    expect(tx).toBe(22);
    expect(ty).toBe(33);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("check update work during move", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .mousemove();
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("check data update during a move", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click({"clientX": 11, "clientY": 23})
        .click({"clientX": 11, "clientY": 23});
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        tx = interaction.getData().getTgtClientX();
        ty = interaction.getData().getTgtClientY();
    });
    interaction.getFsm().addHandler(newHandler);
    robot(canvas).mousemove({"clientX": 30, "clientY": 40});
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(tx).toBe(30);
    expect(ty).toBe(40);
});

test("check data reinitialisation", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .mousemove()
        .click()
        .click();
    expect(interaction.getData().getSrcClientX()).toBe(0);
    expect(interaction.getData().getSrcClientY()).toBe(0);
    expect(interaction.getData().getTgtClientX()).toBe(0);
    expect(interaction.getData().getTgtClientY()).toBe(0);
});

test("check if canceled with Esc after a move", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .mousemove()
        .keydown({"code": "27"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("check if the last DoubleClick with a different button don't stop the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click({"clientX": 11, "clientY": 23, "button": 1})
        .click({"clientX": 11, "clientY": 23, "button": 1})
        .mousemove({"clientX": 20, "clientY": 30, "button": 1})
        .click({"clientX": 20, "clientY": 30, "button": 0})
        .click({"clientX": 20, "clientY": 30, "button": 0});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("specific mouse button checking OK", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 22, 33));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 22, 33));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("several moves ok", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30));
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(5);
});

test("several moves ok with specific mouse button", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 0));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 22, 30, 0));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 23, 30, 0));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 25, 30, 0));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30, 0));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 20, 30, 0));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(7);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("timeout first double click", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23, 1));
    jest.runOnlyPendingTimers();

    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("timeout first Click Update Still OK", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23, 1));
    jest.runOnlyPendingTimers();
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("timeout first Click end Still OK", () => {
    interaction.log(true);
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("click", canvas, undefined, undefined, 11, 23, 1));
    jest.runOnlyPendingTimers();
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("timeout Second Click KO", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    jest.runOnlyPendingTimers();
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));

    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("timeout Second Click OK", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    jest.runOnlyPendingTimers();
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));

    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("first Click Has Target object", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();

    expect(interaction.getData().getTgtObject()).toBe(canvas);
});

test("first Click Has Target Values", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));

    expect(interaction.getData().getTgtClientX()).toBe(11);
    expect(interaction.getData().getTgtClientY()).toBe(23);
    expect(interaction.getData().getButton()).toBe(2);
});

test("move Has Still Src Values", () => {
    interaction.registerToNodes([canvas]);
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("auxclick", canvas, undefined, undefined, 11, 23, 2));
    interaction.processEvent(createMouseEvent("mousemove", canvas, undefined, undefined, 21, 30, 2));

    expect(interaction.getData().getTgtClientX()).toBe(21);
    expect(interaction.getData().getTgtClientY()).toBe(30);
    expect(interaction.getData().getSrcClientX()).toBe(11);
    expect(interaction.getData().getSrcClientY()).toBe(23);
    expect(interaction.getData().getButton()).toBe(2);
});
