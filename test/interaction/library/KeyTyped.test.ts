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

import {EventRegistrationToken, FSMHandler, KeyTyped} from "../../../src/interacto";
import {createKeyEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: KeyTyped;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new KeyTyped();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    text = document.createElement("textarea");
});

test("cannot create several times the FSM", () => {
    interaction.getFsm().buildFSM();
    expect(interaction.getFsm().getStates()).toHaveLength(3);
});

test("type 'a' in the textarea starts and stops the interaction.", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "a"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("only press the key don't stop the interaction.", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("if you release a key different that the one you press, the interaction don't stop", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});
