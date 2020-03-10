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

import { StubFSMHandler } from "../../fsm/StubFSMHandler";
import { EventRegistrationToken } from "../../../src/fsm/Events";
import { createKeyEvent } from "../StubEvents";
import { FSMHandler } from "../../../src/fsm/FSMHandler";
import { KeyTyped } from "../../../src/interaction/library/KeyTyped";

jest.mock("../../fsm/StubFSMHandler");

let interaction: KeyTyped;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    handler = new StubFSMHandler();
    interaction = new KeyTyped();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><textarea id='text1'></textarea></div></html>";
    const elt = document.getElementById("text1");
    if (elt !== null) {
        text = elt;
    }
});

test("type 'a' in the textarea starts and stops the interaction.", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "a"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("only press the key don't stop the interaction.", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("only press the key cancel the interaction after a timeout.", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

test("if you release a key different that the one you press, the interaction don't stop", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "b"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});
