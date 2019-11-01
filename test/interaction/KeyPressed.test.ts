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

import { StubFSMHandler } from "../fsm/StubFSMHandler";
import { EventRegistrationToken } from "../../src/fsm/Events";
import { createKeyEvent } from "./StubEvents";
import { FSMHandler } from "../../src/fsm/FSMHandler";
import { KeyPressed } from "../../src/interaction/library/KeyPressed";

jest.mock("../fsm/StubFSMHandler");

let interaction: KeyPressed;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new KeyPressed(false);
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><textarea id='text1'></textarea></div></html>";
    const elt = document.getElementById("text1");
    if (elt !== null) {
        text = elt;
    }
});

test("Type 'a' in the textarea starts and stops the interaction.", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("The key typed in the textarea is the same key in the data of the interaction.", () => {
    interaction.registerToNodes([text]);
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public constructor() {
            super();
        }

        public fsmUpdates(): void {
            expect(interaction.getData().getKey()).toEqual("a");
        }
    }());
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
});
