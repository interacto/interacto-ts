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

import {DragLock, EventRegistrationToken, FSMHandler} from "../../../src/interacto";
import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {createMouseEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: DragLock;
let svg: SVGSVGElement;
let handler: FSMHandler;
let rect1: SVGRectElement;
let rect2: SVGRectElement;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new DragLock();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html></html>";
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    document.body.appendChild(svg);
    rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    svg.appendChild(rect1);
    svg.appendChild(rect2);
});

test("dragLock in a SVG environment", () => {
    interaction.registerToNodes([rect1, rect2]);
    rect2.dispatchEvent(createMouseEvent(EventRegistrationToken.click, rect2));
    rect2.dispatchEvent(createMouseEvent(EventRegistrationToken.click, rect2));
    rect2.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, rect2));
    rect1.dispatchEvent(createMouseEvent(EventRegistrationToken.click, rect1));
    rect1.dispatchEvent(createMouseEvent(EventRegistrationToken.click, rect1));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("dragLock data in a SVG environment", () => {
    let tx: number | undefined;
    let ty: number | undefined;
    let sx: number | undefined;
    let sy: number | undefined;
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmStops(): void {
            sx = interaction.getData().getSrcClientX();
            sy = interaction.getData().getSrcClientY();
            tx = interaction.getData().getTgtClientX();
            ty = interaction.getData().getTgtClientY();
        }
    }());
    interaction.processEvent(createMouseEvent(EventRegistrationToken.click, rect1, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.click, rect1, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseMove, svg, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.click, rect2, undefined, undefined, 22, 33));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.click, rect2, undefined, undefined, 22, 33));
    expect(sx).toBe(11);
    expect(sy).toBe(23);
    expect(tx).toBe(22);
    expect(ty).toBe(33);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});
