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

import {FSMHandler, KeysTyped} from "../../../src/interacto";
import {createKeyEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: KeysTyped;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new KeysTyped();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    text = document.createElement("textarea");
});

test("cannot create several times the FSM", () => {
    interaction.getFsm().buildFSM();
    expect(interaction.getFsm().getStates()).toHaveLength(3);
});

test("type 'b' and wait for timeout stops the interaction", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "b"));
    text.dispatchEvent(createKeyEvent("keyup", "b"));
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("type 'b' and wait for timeout stops the interaction: data", () => {
    let keys: Array<string> = [];

    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        keys = [...interaction.getData().getKeys()];
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "b"));
    text.dispatchEvent(createKeyEvent("keyup", "b"));
    jest.runOnlyPendingTimers();
    expect(keys).toHaveLength(1);
    expect(keys[0]).toStrictEqual("b");
});

test("type text and wait for timeout stops the interaction", () => {
    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "b"));
    text.dispatchEvent(createKeyEvent("keyup", "b"));
    text.dispatchEvent(createKeyEvent("keydown", "c"));
    text.dispatchEvent(createKeyEvent("keyup", "c"));
    text.dispatchEvent(createKeyEvent("keydown", "a"));
    text.dispatchEvent(createKeyEvent("keyup", "a"));
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
});

test("type text and wait for timeout stops the interaction: data", () => {
    let keys: Array<string> = [];

    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        keys = [...interaction.getData().getKeys()];
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "b"));
    text.dispatchEvent(createKeyEvent("keyup", "b"));
    text.dispatchEvent(createKeyEvent("keydown", "c"));
    text.dispatchEvent(createKeyEvent("keyup", "c"));
    text.dispatchEvent(createKeyEvent("keydown", "a"));
    text.dispatchEvent(createKeyEvent("keyup", "a"));
    jest.runOnlyPendingTimers();
    expect(keys).toHaveLength(3);
    expect(keys).toStrictEqual(["b", "c", "a"]);
});

test("type 'b' does not stop the interaction", () => {
    let keys: Array<string> = [];

    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        keys = [...interaction.getData().getKeys()];
    });
    interaction.getFsm().addHandler(newHandler);

    interaction.registerToNodes([text]);
    text.dispatchEvent(createKeyEvent("keydown", "z"));
    text.dispatchEvent(createKeyEvent("keyup", "z"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalledWith();
    expect(keys).toHaveLength(1);
    expect(keys[0]).toStrictEqual("z");
});
