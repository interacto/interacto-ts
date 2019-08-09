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

import {FSMHandler} from "../../src/src-core/fsm/FSMHandler";
import {StubFSMHandler} from "../fsm/StubFSMHandler";
import {DoubleClick} from "../../src/interaction/library/DoubleClick";
import {EventRegistrationToken} from "../../src/interaction/Events";
import {createMouseEvent} from "./StubEvents";

jest.mock("../fsm/StubFSMHandler");

let interaction: DoubleClick;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    handler = new StubFSMHandler();
    interaction = new DoubleClick();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("Double click on a canvas starts and stops the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("Check data of the interaction.", () => {
    interaction.registerToNodes([canvas]);
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }

        public fsmStops() {
            expect(interaction.getData().getSrcClientX()).toBe(11);
            expect(interaction.getData().getSrcClientY()).toBe(23);
            expect(interaction.getData().getButton()).toBe(0);
        }
    }());
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas,  undefined, undefined, 11,
        23));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined, 11,
        23));
});

test("Move between clicks cancels the double click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.click();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("Timout cancels the double click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    jest.runOnlyPendingTimers();
    canvas.click();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("Double click with two different mouse button for each click don't start the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined,
        undefined, undefined, 0));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined,
        undefined, undefined, 2));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

// test("Check the reinitData of the DoubleClicked interaction", () => {
//     interaction.registerToNodes([canvas]);
//     canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined,
//         11, 23, 0));
//     canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.Click, canvas, undefined, undefined,
//         11, 23, 0));
//     jest.runOnlyPendingTimers();
//     expect(interaction.getData().getSrcClientX()).toBe(undefined);
//     expect(interaction.getData().getSrcClientY()).toBe(undefined);
//     expect(interaction.getData().getButton()).toBe(0);
// });

test("Check if the interaction is recycled after a cancel", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.click();
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("Check if the interaction work fine with bad move", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas, undefined, undefined, undefined,
        undefined, 1));
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});
