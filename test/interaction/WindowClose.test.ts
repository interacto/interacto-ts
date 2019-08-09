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
import {WindowClosed} from "../../src/interaction/library/WindowClosed";

jest.mock("../fsm/StubFSMHandler");

let interaction: WindowClosed;
let close: HTMLElement;
let handler: FSMHandler;
const element = document.defaultView;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new WindowClosed();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><iframe id='clo1'></iframe></html>";
    const elt2 = document.getElementById("clo1");
    if (elt2 !== null) {
        close = elt2;
    }
});

test("Exit the window (browser) starts and stops the interaction", () => {
    interaction.registerToNodes([element]);
    element.dispatchEvent(new Event("beforeunload"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Exit document window don't start the interaction", () => {
    interaction.registerToNodes([close]);
    close.dispatchEvent(new Event("beforeunload"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(0);
});
