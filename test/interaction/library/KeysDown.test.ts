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
import {KeysDataImpl, KeysDown, peek} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: KeysDown;
let text: HTMLElement;
let handler: FSMHandler;
let data: KeysDataImpl;

beforeEach(() => {
    data = new KeysDataImpl();
    handler = mock<FSMHandler>();
    interaction = new KeysDown();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    text = document.createElement("textarea");
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM();
    expect(interaction.fsm.states).toHaveLength(count);
});

test("testKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    robot(text).keydown({"code": "A"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testKeyPressData", () => {
    interaction.registerToNodes([text]);

    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        data.addKey(peek(interaction.data.keys) as KeyData);
    });
    interaction.fsm.addHandler(newHandler);

    robot(text).keydown({"code": "A"});

    expect(data.keys).toHaveLength(1);
    expect(data.keys[0].code).toBe("A");
});

test("testTwoKeyPressExecution", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "A"})
        .keydown({"code": "B"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testTwoKeyPressData", () => {
    interaction.registerToNodes([text]);

    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        data.addKey(peek(interaction.data.keys) as KeyData);
    });
    interaction.fsm.addHandler(newHandler);
    robot(text)
        .keydown({"code": "A"})
        .keydown({"code": "B"});
    expect(data.keys).toHaveLength(2);
    expect(data.keys[0].code).toBe("A");
    expect(data.keys[1].code).toBe("B");
});

test("testTwoKeyPressReleaseExecution", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "A"})
        .keydown({"code": "B"})
        .keyup({"code": "B"});
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});


test("testTwoKeyPressReleaseData", () => {
    interaction.registerToNodes([text]);

    robot(text)
        .keydown({"code": "A"})
        .keydown({"code": "B"});
    const newHandler = mock<FSMHandler>();
    newHandler.fsmUpdates.mockImplementation(() => {
        data.addKey(peek(interaction.data.keys) as KeyData);
    });
    interaction.fsm.addHandler(newHandler);
    robot(text).keyup({"code": "B"});
    expect(data.keys).toHaveLength(1);
    expect(data.keys[0].code).toBe("A");
});

test("testTwoKeyPressReleaseRecycle", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "A"})
        .keydown({"code": "B"})
        .keyup({"code": "B"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("testTwoKeyPressTwoReleasesExecution", () => {
    interaction.registerToNodes([text]);
    robot(text)
        .keydown({"code": "A"})
        .keydown({"code": "B"})
        .keyup({"code": "A"})
        .keyup({"code": "B"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
});
