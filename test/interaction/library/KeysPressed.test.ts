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

import {FSMHandler, KeysPressed} from "../../../src/interacto";
import {createKeyEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: KeysPressed;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new KeysPressed();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    text = document.createElement("textarea");
});


test("testKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "A"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testKeyPressData", () => {
    interaction.registerToNodes([text]);
    let length = 0;
    let txt = "";

    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        length = interaction.getData().getKeys().length;
        txt = interaction.getData().getKeys()[0];
    });
    interaction.getFsm().addHandler(newHandler);

    text.dispatchEvent(createKeyEvent("keydown", "A"));
    expect(length).toStrictEqual(1);
    expect(txt).toStrictEqual("A");
});

test("testTwoKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "A"));
    text.dispatchEvent(createKeyEvent("keydown", "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testTwoKeyPressData", () => {
    interaction.registerToNodes([text]);
    let data: Array<string> = [];

    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        data = [...interaction.getData().getKeys()];
    });
    interaction.getFsm().addHandler(newHandler);

    text.dispatchEvent(createKeyEvent("keydown", "A"));
    text.dispatchEvent(createKeyEvent("keydown", "B"));
    expect(data).toHaveLength(2);
    expect(data[0]).toStrictEqual("A");
    expect(data[1]).toStrictEqual("B");
});

test("testTwoKeyPressReleaseExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "A"));
    text.dispatchEvent(createKeyEvent("keydown", "B"));
    text.dispatchEvent(createKeyEvent("keyup", "B"));
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});


test("testTwoKeyPressReleaseData", () => {
    interaction.registerToNodes([text]);
    let data: Array<string> = [];

    text.dispatchEvent(createKeyEvent("keydown", "A"));
    text.dispatchEvent(createKeyEvent("keydown", "B"));
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        data = [...interaction.getData().getKeys()];
    });
    interaction.getFsm().addHandler(newHandler);
    text.dispatchEvent(createKeyEvent("keyup", "B"));
    expect(data).toHaveLength(1);
    expect(data[0]).toStrictEqual("A");
});

test("testTwoKeyPressReleaseRecycle", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "A"));
    text.dispatchEvent(createKeyEvent("keydown", "B"));
    text.dispatchEvent(createKeyEvent("keyup", "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("testTwoKeyPressTwoReleasesExecution", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "A"));
    text.dispatchEvent(createKeyEvent("keydown", "B"));
    text.dispatchEvent(createKeyEvent("keyup", "A"));
    text.dispatchEvent(createKeyEvent("keyup", "B"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
});
