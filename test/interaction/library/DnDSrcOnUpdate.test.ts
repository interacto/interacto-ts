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

import { DnD } from "../../../src/interaction/library/DnD";
import { FSMHandler } from "../../../src/fsm/FSMHandler";
import { StubFSMHandler } from "../../fsm/StubFSMHandler";
import { createMouseEvent } from "../StubEvents";
import { EventRegistrationToken } from "../../../src/fsm/Events";

jest.mock("../../fsm/StubFSMHandler");

let interaction: DnD;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new DnD(true, false);
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><canvas id='cav1'></canvas></html>";
    const elt = document.getElementById("cav1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("press event don't trigger the interaction DnD", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

//TODO Test always pass WIP
test("check data when pressing", () => {
    interaction.registerToNodes([canvas]);
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }

        public fsmStarts(): void {
            expect(interaction.getData().getSrcClientX()).toBe(11);
            expect(interaction.getData().getSrcClientY()).toBe(23);
            expect(interaction.getData().getTgtClientX()).toBe(11);
            expect(interaction.getData().getTgtClientY()).toBe(23);
            expect(interaction.getData().getButton()).toBe(0);
        }
    }());
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas, undefined, undefined, 11, 23));
});

test("click and move and release start and update the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("data of the press and drag part of the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas, undefined, undefined, 15, 20, 0));
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }

        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(15);
            expect(interaction.getData().getSrcClientY()).toBe(20);
            expect(interaction.getData().getTgtClientX()).toBe(16);
            expect(interaction.getData().getTgtClientY()).toBe(21);
            expect(interaction.getData().getButton()).toBe(0);
            const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
            expect(tgtElem).toBe(canvas);
        }
    }());
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 16, 21));
});

test("check data with multiple drag", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas, undefined, undefined, 11, 23, 0));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 12, 22, 0));
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }

        public fsmUpdates(): void {
            expect(interaction.getData().getSrcClientX()).toBe(12);
            expect(interaction.getData().getSrcClientY()).toBe(22);
            expect(interaction.getData().getTgtClientX()).toBe(12);
            expect(interaction.getData().getTgtClientY()).toBe(24);
            expect(interaction.getData().getButton()).toBe(0);
        }
    }());
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, 12, 24, 0));
});
