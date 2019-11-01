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
import { Scroll } from "../../src/interaction/library/Scroll";
import { createUIEvent } from "./StubEvents";

jest.mock("../fsm/StubFSMHandler");

let interaction: Scroll;
let scroll: Window;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new Scroll();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div></div></html>";
    const elt = document.defaultView;
    if (elt !== null) {
        scroll = elt;
    }
});

test("Scroll event start and stop the interaction", () => {
    interaction.registerToNodes([scroll]);
    scroll.dispatchEvent(createUIEvent("scroll"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Multiple scroll trigger multiple interaction that start and stop", () => {
    interaction.registerToNodes([scroll]);
    scroll.dispatchEvent(createUIEvent("scroll"));
    scroll.dispatchEvent(createUIEvent("scroll"));
    scroll.dispatchEvent(createUIEvent("scroll"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(3);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(3);
});
