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

import {ButtonBinder} from "../../src/binding/ButtonBinder";
import {StubFSMHandler} from "../fsm/StubFSMHandler";
import {TSWidgetBinding} from "../../src/binding/TSWidgetBinding";
import {ButtonPressed} from "../../src/interaction/library/ButtonPressed";
import {StubCmd} from "../command/StubCmd";
import {WidgetData} from "../../src/src-core/interaction/WidgetData";

jest.mock("../fsm/StubFSMHandler");
jest.mock("../command/StubCmd");

let button: HTMLElement;
let binding: TSWidgetBinding<StubCmd, ButtonPressed, WidgetData<Element>>;

beforeEach(() => {
    jest.clearAllMocks();
    const binder = new ButtonBinder(() => new StubCmd());
    document.documentElement.innerHTML = "<html><div><button id='b1'>A Button</button></div></html>";
    const elt = document.getElementById("b1");
    if (elt !== null) {
        button = elt;
        binder.on(button);
    }
    binding = binder.bind();
});

test("Button binder produces a binding", () => {
    expect(binding).not.toBeNull();
});

test("Click on button triggers the interaction", () => {
    const handler = new StubFSMHandler();
    binding.getInteraction().getFsm().addHandler(handler);
    button.click();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Click on button produces a command", () => {
    button.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});
