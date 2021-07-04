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

import type {FSMHandler, KeyData} from "../../../src/interacto";
import {KeysDataImpl, KeysTyped, peek} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: KeysTyped;
let text: HTMLElement;
let handler: FSMHandler;
let data: KeysDataImpl;

beforeEach(() => {
    jest.useFakeTimers();
    data = new KeysDataImpl();
    handler = mock<FSMHandler>();
    interaction = new KeysTyped();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    text = document.createElement("textarea");
});

test("cannot create several times the FSM", () => {
    interaction.fsm.buildFSM();
    expect(interaction.fsm.states).toHaveLength(3);
});

test("type 'b' and wait for timeout stops the interaction", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("type 'b' and wait for timeout stops the interaction: data", () => {
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        data.addKey(peek(interaction.data.keys) as KeyData);
    });
    interaction.fsm.addHandler(newHandler);

    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();
    expect(data.keys).toHaveLength(1);
    expect(data.keys[0].code).toStrictEqual("b");
});

test("type text and wait for timeout stops the interaction", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "b"})
        .keyup({"code": "b"})
        .keydown({"code": "c"})
        .keyup({"code": "c"})
        .keydown({"code": "a"})
        .keyup({"code": "a"});
    jest.runOnlyPendingTimers();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
});

test("type text and wait for timeout stops the interaction: data", () => {
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        interaction.data.keys.forEach(k => {
            data.addKey(k);
        });
    });
    interaction.fsm.addHandler(newHandler);

    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "b"})
        .keyup({"code": "b"})
        .keydown({"code": "c"})
        .keyup({"code": "c"})
        .keydown({"code": "a"})
        .keyup({"code": "a"});
    jest.runOnlyPendingTimers();
    expect(data.keys).toHaveLength(3);
    expect(data.keys[0].code).toStrictEqual("b");
    expect(data.keys[1].code).toStrictEqual("c");
    expect(data.keys[2].code).toStrictEqual("a");
});

test("type 'b' does not stop the interaction", () => {
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        data.addKey(peek(interaction.data.keys) as KeyData);
    });
    interaction.fsm.addHandler(newHandler);

    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "z"})
        .keyup({"code": "z"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalledWith();
    expect(data.keys).toHaveLength(1);
    expect(data.keys[0].code).toStrictEqual("z");
});
