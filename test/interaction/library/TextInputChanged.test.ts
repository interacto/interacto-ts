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

import {FSMHandler, TextInputChanged} from "../../../src/interacto";
import {StubFSMHandler} from "../../fsm/StubFSMHandler";

jest.mock("../../fsm/StubFSMHandler");
jest.useFakeTimers();

let interaction: TextInputChanged;
let textArea: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new TextInputChanged();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML =
        "<html><div><input id='inT' type='text'/></div><div><textarea id='teA'/></textarea></div></html>";
    textArea = document.getElementById("teA") as HTMLElement;
});

test("type in a text area starts and stops the interaction", () => {
    interaction.registerToNodes([textArea]);
    textArea.dispatchEvent(new InputEvent("input"));
    jest.runOnlyPendingTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
