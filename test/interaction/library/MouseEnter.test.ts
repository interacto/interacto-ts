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
import {MouseEnter, PointDataImpl} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {createMouseEvent, createMouseEvent2, robot} from "../StubEvents";

let interaction: MouseEnter;
let interactionWithoutBubbling: MouseEnter;
let canvas: HTMLElement;
let handler: FSMHandler & MockProxy<FSMHandler>;
let handler2: FSMHandler & MockProxy<FSMHandler>;

beforeEach(() => {
    handler = mock<FSMHandler>();
    handler2 = mock<FSMHandler>();

    interaction = new MouseEnter(true);
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);

    interactionWithoutBubbling = new MouseEnter(false);
    interactionWithoutBubbling.log(true);
    interactionWithoutBubbling.fsm.log = true;
    interactionWithoutBubbling.fsm.addHandler(handler2);

    canvas = document.createElement("canvas");
});

test("cannot create several times the FSM", () => {
    interaction.fsm.buildFSM();
    expect(interaction.fsm.states).toHaveLength(2);
});

test("mouseover sent to the interaction starts and stops the MouseEnter interaction", () => {
    interaction.registerToNodes([canvas]);

    const evt = createMouseEvent("mouseover",
        canvas, 11, 43, 12, 11, 1);
    interaction.processEvent(evt);

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("mouseover on an element starts and stops the MouseEnter interaction", () => {
    interaction.registerToNodes([canvas]);

    const evt = createMouseEvent("mouseover",
        canvas, 11, 43, 12, 11, 1);
    canvas.dispatchEvent(evt);

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("mouseenter sent to the interaction starts and stops the MouseEnter interaction if bubbling disabled", () => {
    interactionWithoutBubbling.registerToNodes([canvas]);

    const evt = createMouseEvent("mouseenter",
        canvas, 11, 43, 12, 11, 1);
    interactionWithoutBubbling.processEvent(evt);

    expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStops).toHaveBeenCalledTimes(1);
});

test("mouseenter on an element starts and stops the MouseEnter interaction if bubbling disabled", () => {
    interactionWithoutBubbling.registerToNodes([canvas]);

    const evt = createMouseEvent("mouseenter",
        canvas, 11, 43, 12, 11, 1);
    canvas.dispatchEvent(evt);

    expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStops).toHaveBeenCalledTimes(1);
});

test("mouseenter doesn't trigger the interaction if bubbling enabled", () => {
    interaction.registerToNodes([canvas]);
    robot().mouseenter(canvas);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("mouseover doesn't trigger the interaction if bubbling disabled", () => {
    interactionWithoutBubbling.registerToNodes([canvas]);
    robot().mouseover(canvas);
    expect(handler2.fsmStarts).not.toHaveBeenCalled();
});

test("other events don't trigger the interaction.", () => {
    interaction.registerToNodes([canvas]);
    robot().input(canvas);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("testMouseEventData", () => {
    const data = new PointDataImpl();
    const expected = new PointDataImpl();
    expected.copy({
        "altKey": true,
        "button": 1,
        "buttons": 0,
        "clientX": 11,
        "clientY": 22,
        "ctrlKey": false,
        "currentTarget": canvas,
        "metaKey": true,
        "movementX": 10,
        "movementY": 20,
        "offsetX": 30,
        "offsetY": 40,
        "pageX": 50,
        "pageY": 60,
        "relatedTarget": canvas,
        "screenX": 111,
        "screenY": 222,
        "shiftKey": true,
        "target": canvas,
        "timeStamp": 0
    });

    handler.fsmStops.mockImplementation(() => {
        data.copy(interaction.data);
    });
    interaction.processEvent(createMouseEvent2("mouseover", expected));
    expect(data).toStrictEqual(expected);
});

test("testMouseoverOnWidgetData", () => {
    const data = new PointDataImpl();

    handler.fsmStops.mockImplementation(() => {
        data.copy(interaction.data);
    });
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(new MouseEvent("mouseover", {"screenX": 111, "screenY": 222, "clientX": 11, "clientY": 22}));
    expect(data.clientX).toStrictEqual(11);
    expect(data.clientY).toStrictEqual(22);
    expect(data.screenX).toStrictEqual(111);
    expect(data.screenY).toStrictEqual(222);
});
