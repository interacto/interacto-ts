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

import {EventRegistrationToken, FSMHandler, KeysPressed} from "../../../src/interacto";
import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {createKeyEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: KeysPressed;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new KeysPressed();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><textarea id='text1'></textarea></div></html>";
    text = document.getElementById("text1") as HTMLElement;
});


test("testKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testKeyPressData", () => {
    interaction.registerToNodes([text]);
    let length = 0;
    let txt = "";

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            length = interaction.getData().getKeys().length;
            txt = interaction.getData().getKeys()[0];
        }
    }());

    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    expect(length).toStrictEqual(1);
    expect(txt).toStrictEqual("A");
});

test("testTwoKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testTwoKeyPressData", () => {
    interaction.registerToNodes([text]);
    let data: Array<string> = [];

    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            data = [...interaction.getData().getKeys()];
        }
    }());

    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    expect(data).toHaveLength(2);
    expect(data[0]).toStrictEqual("A");
    expect(data[1]).toStrictEqual("B");
});

test("testTwoKeyPressReleaseExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});


test("testTwoKeyPressReleaseData", () => {
    interaction.registerToNodes([text]);
    let data: Array<string> = [];

    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    interaction.getFsm().addHandler(new class extends StubFSMHandler {
        public fsmUpdates(): void {
            data = [...interaction.getData().getKeys()];
        }
    }());
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(data).toHaveLength(1);
    expect(data[0]).toStrictEqual("A");
});

test("testTwoKeyPressReleaseRecycle", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("testTwoKeyPressTwoReleasesExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "B"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "A"));
    text.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
});
