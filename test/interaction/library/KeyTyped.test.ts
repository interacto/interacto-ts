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

import type {FSMHandler} from "../../../src/interacto";
import {KeyDataImpl, KeyTyped} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: KeyTyped;
let text: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new KeyTyped();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    text = document.createElement("textarea");
});

test("cannot create several times the FSM", () => {
    interaction.fsm.buildFSM();
    expect(interaction.fsm.states).toHaveLength(3);
});

test("type 'a' in the textarea starts and stops the interaction.", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "a"})
        .keyup({"code": "a"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("only press the key don't stop the interaction.", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "a"});
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("if you release a key different that the one you press, the interaction don't stop", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "a"})
        .keyup({"code": "b"});
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("data is ok", () => {
    const data = new KeyDataImpl();
    interaction.registerToNodes([text]);
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        data.copy(interaction.data);
    });
    interaction.fsm.addHandler(newHandler);
    robot(text)
        .keydown({"code": "z"})
        .keyup({"code": "z"});
    expect(data.code).toBe("z");
});
