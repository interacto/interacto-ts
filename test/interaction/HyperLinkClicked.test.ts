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
import { HyperLinkClicked } from "../../src/interaction/library/HyperLinkClicked";

jest.mock("../fsm/StubFSMHandler");

let interaction: HyperLinkClicked;
let url: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new HyperLinkClicked();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><a id='url1' href=''>Test</a> </div></html>";
    const elt = document.getElementById("url1");
    if (elt !== null) {
        url = elt;
    }
});

test("Click on url starts and stops the interaction", () => {
    interaction.registerToNodes([url]);
    url.dispatchEvent(new Event("input"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
