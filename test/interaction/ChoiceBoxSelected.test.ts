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
import {ChoiceBoxSelected} from "../../src/interaction/library/ChoiceBoxSelected";

jest.mock("../fsm/StubFSMHandler");

let interaction: ChoiceBoxSelected;
let choiceBox: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new ChoiceBoxSelected();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><select id='sel1'><option value='test'>Test</option>" +
        "<option value='Test2'>Test2</option></div></html>";
    const elt = document.getElementById("sel1");
    if (elt !== null) {
        choiceBox = elt;
    }
});

test("Input event starts and stops the interaction ChoiceBoxSelected", () => {
    interaction.registerToNodes([choiceBox]);
    choiceBox.dispatchEvent(new Event("input"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Other event don't start the interaction ChoiceBoxSelected", () => {
    interaction.registerToNodes([choiceBox]);
    choiceBox.click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(0);
});

test("Multiple input event on choiceBox start and stop the interaction each time.", () => {
   interaction.registerToNodes([choiceBox]);
   choiceBox.dispatchEvent(new Event("input"));
   choiceBox.dispatchEvent(new Event("input"));
   expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
   expect(handler.fsmStops).toHaveBeenCalledTimes(2);
});
