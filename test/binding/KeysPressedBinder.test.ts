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

import {KeysPressedBinder} from "../../src/binding/KeysPressedBinder";
import {EventRegistrationToken} from "../../src/fsm/Events";
import {KeysData} from "../../src/interaction/library/KeysData";
import {KeysPressed} from "../../src/interaction/library/KeysPressed";
import {StubCmd} from "../command/StubCmd";
import {StubFSMHandler} from "../fsm/StubFSMHandler";
import {createKeyEvent} from "../interaction/StubEvents";
import { WidgetBindingImpl } from "../../src";

jest.mock("../fsm/StubFSMHandler");
jest.mock("../command/StubCmd");

let div: HTMLElement;
let binding: WidgetBindingImpl<StubCmd, KeysPressed, KeysData>;

beforeEach(() => {
    jest.clearAllMocks();
    const binder = new KeysPressedBinder(() => new StubCmd());
    document.documentElement.innerHTML = "<html><div id='dv1'></div></html>";
    const elt = document.getElementById("dv1");
    if (elt !== null) {
        div = elt;
        binder.on(div);
    }
    binding = binder.bind();
});

test("KeysPressedBinder produces a binding", () => {
    expect(binding).not.toBeNull();
});

test("Press keys triggers the interaction", () => {
    const handler = new StubFSMHandler();
    binding.getInteraction().getFsm().addHandler(handler);
    div.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "ControlLeft"));
    div.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyDown, "KeyS"));
    div.dispatchEvent(createKeyEvent(EventRegistrationToken.KeyUp, "KeyS"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
