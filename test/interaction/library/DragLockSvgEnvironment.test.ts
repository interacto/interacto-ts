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

import type {FSMHandler, Logger} from "../../../src/interacto";
import {DragLock, SrcTgtPointsDataImpl} from "../../../src/interacto";
import {createMouseEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: DragLock;
let svg: SVGSVGElement;
let handler: FSMHandler;
let rect1: SVGRectElement;
let rect2: SVGRectElement;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new DragLock(mock<Logger>());
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    document.documentElement.innerHTML = "<html></html>";
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    document.body.append(svg);
    rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    svg.append(rect1);
    svg.append(rect2);
});

test("dragLock in a SVG environment", () => {
    interaction.registerToNodes([rect1, rect2]);
    robot()
        .click(rect2, 2)
        .mousemove()
        .click(rect1, 2);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("dragLock data in a SVG environment", () => {
    const data = new SrcTgtPointsDataImpl();
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops = jest.fn(() => {
        data.copySrc(interaction.data.src);
        data.copyTgt(interaction.data.tgt);
    });
    interaction.fsm.addHandler(newHandler);
    interaction.processEvent(createMouseEvent("click", rect1, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("click", rect1, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent("mousemove", svg, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent("click", rect2, undefined, undefined, 22, 33));
    interaction.processEvent(createMouseEvent("click", rect2, undefined, undefined, 22, 33));
    expect(data.src.clientX).toBe(11);
    expect(data.src.clientY).toBe(23);
    expect(data.tgt.clientX).toBe(22);
    expect(data.tgt.clientY).toBe(33);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});
