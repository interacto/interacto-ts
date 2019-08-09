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
import {Click} from "../../src/interaction/library/Click";
import {EventRegistrationToken} from "../../src/interaction/Events";
import {createMouseEvent} from "./StubEvents";

jest.mock("../fsm/StubFSMHandler");

let interaction: Click;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new Click();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        canvas = elt;
    }
});

test("Click on a element starts and stops the interaction Click", () => {
    interaction.registerToNodes([canvas]);
    canvas.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("Other event don't trigger the interaction.", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(new Event("input"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("Press on a canvas then move don't starts the interaction", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

// test("Check data of the interaction", () => {
//     interaction.registerToNodes([canvas]);
//     const evt = document.createEvent("MouseEvent");
//     evt.initMouseEvent("click", true, false, window, 0, 0, 0, 15,
//         20, false, false, false, false, 0, null);
//     interaction.getFsm().addHandler(new class extends StubFSMHandler {
//         public constructor() {
//             super();
//         }
//
//         public fsmStarts() {
//             expect(interaction.getData().getSrcClientY()).toEqual(15);
//             expect(interaction.getData().getSrcClientY()).toEqual(20);
//             expect(interaction.getData().getButton()).toEqual(0);
//         }
//     }());
//     canvas.dispatchEvent(evt);
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
// });
