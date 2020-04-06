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

import {EventRegistrationToken, FSMHandler, Press} from "../../../src/interacto";
import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {createMouseEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: Press;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new Press();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    canvas = document.getElementById("canvas1") as HTMLElement;
});

test("press on the canvas starts and stops interaction Press", () => {
    interaction.registerToNodes([canvas]);
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
