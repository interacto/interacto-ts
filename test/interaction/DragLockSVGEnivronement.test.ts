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

import { FSMHandler } from "../../src/fsm/FSMHandler";
import { StubFSMHandler } from "../fsm/StubFSMHandler";
import { DragLock } from "../../src/interaction/library/DragLock";
import { createMouseEvent } from "./StubEvents";
import { EventRegistrationToken } from "../../src/fsm/Events";

jest.mock("../fsm/StubFSMHandler");

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
    rect2.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, rect2));
    rect2.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, rect2));
    rect2.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, rect2));
    rect1.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, rect1));
    rect1.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, rect1));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("dragLock data in a SVG environment", () => {
    let srcX = -1;
    let srcY = -1;
    let tgtX = -1;
    let tgtY = -1;
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmStops(): void {
            srcX = interaction.getData().getSrcClientX();
            srcY = interaction.getData().getSrcClientY();
            tgtX = interaction.getData().getTgtClientX();
            tgtY = interaction.getData().getTgtClientY();
        }
    }());
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, rect1, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, rect1, undefined, undefined, 11, 23));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.MouseMove, svg, undefined, undefined, 20, 30));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, rect2, undefined, undefined, 22, 33));
    interaction.processEvent(createMouseEvent(EventRegistrationToken.Click, rect2, undefined, undefined, 22, 33));
    expect(srcX).toBe(11);
    expect(srcY).toBe(23);
    expect(tgtX).toBe(22);
    expect(tgtY).toBe(33);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});
