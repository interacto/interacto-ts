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
import { ComboBoxSelected } from "../../src/interaction/library/ComboBoxSelected";

jest.mock("../fsm/StubFSMHandler");

let interaction: ComboBoxSelected;
let comboBox: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new ComboBoxSelected();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML =
        "<html><div><select id='comb1'><option value='v1'>Volvo</option></select></html>";
    const elt = document.getElementById("comb1");
    if (elt !== null) {
        comboBox = elt;
    }
});

test("Input event starts and stops the interaction ComboBoxSelected", () => {
    interaction.registerToNodes([comboBox]);
    comboBox.dispatchEvent(new Event("input"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Other event don't trigger the interaction", () => {
    interaction.registerToNodes([comboBox]);
    comboBox.dispatchEvent(new Event("change"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});
