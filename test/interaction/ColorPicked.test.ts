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

import {FSMHandler} from "../../src/fsm/FSMHandler";
import {StubFSMHandler} from "../fsm/StubFSMHandler";
import {ColorPicked} from "../../src/interaction/library/ColorPicked";

jest.mock("../fsm/StubFSMHandler");

let interaction: ColorPicked;
let colorBox: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new ColorPicked();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><input id='col1' type='color'></div></html>";
    const elt = document.getElementById("col1");
    if (elt !== null) {
        colorBox = elt;
    }
});

test("Input event starts and stops the interaction ColorPicked", () => {
    interaction.registerToNodes([colorBox]);
    colorBox.dispatchEvent(new Event("input"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Other event don't trigger the interaction", () => {
    interaction.registerToNodes([colorBox]);
    colorBox.dispatchEvent(new Event("click"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});
