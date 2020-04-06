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

import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {EventRegistrationToken, FSMHandler, KeysTyped} from "../../../src/interacto";
import {createKeyEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: KeysTyped;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    handler = new StubFSMHandler();
    interaction = new KeysTyped();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><textarea id='text1'></textarea></div></html>";
    text = document.getElementById("text1") as HTMLElement;
});

test("cannot create several times the FSM", () => {
    interaction.getFsm().buildFSM();
    expect(interaction.getFsm().getStates()).toHaveLength(3);
});

test("type 'b' and wait for timeout stops the interaction", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "b"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("type 'b' and wait for timeout stops the interaction: data", () => {
    let keys: Array<string> = [];

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmStops(): void {
            keys = [...interaction.getData().getKeys()];
        }
    }());

    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "b"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(keys).toHaveLength(1);
    expect(keys[0]).toStrictEqual("b");
});

test("type text and wait for timeout stops the interaction", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "b"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "b"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "c"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "c"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "a"));
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(6);
});

test("type text and wait for timeout stops the interaction: data", () => {
    let keys: Array<string> = [];

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmStops(): void {
            keys = [...interaction.getData().getKeys()];
        }
    }());

    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "b"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "b"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "c"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "c"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "a"));
    jest.runOnlyPendingTimers();
    expect(keys).toHaveLength(3);
    expect(keys).toStrictEqual(["b", "c", "a"]);
});

test("type 'b' does not stop the interaction", () => {
    let keys: Array<string> = [];

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            keys = [...interaction.getData().getKeys()];
        }
    }());

    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "z"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "z"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalledWith();
    expect(keys).toHaveLength(1);
    expect(keys[0]).toStrictEqual("z");
});
