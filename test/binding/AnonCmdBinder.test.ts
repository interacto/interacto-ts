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

import {
    AnonCmd,
    anonCmdBinder,
    ButtonPressed,
    CommandsRegistry,
    InteractionData,
    isButton,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";

interface A {
    foo(): void;
}

let button1: HTMLButtonElement;
let button2: HTMLButtonElement;
let a: A;
let binding: WidgetBinding<AnonCmd, ButtonPressed, InteractionData>;

beforeEach(() => {
    document.documentElement.innerHTML = "<html><div><button id='b1'>A Button</button><button id='b2'>A Button2</button></div></html>";
    const elt1 = document.getElementById("b1");
    if (elt1 !== null && isButton(elt1)) {
        button1 = elt1;
    }
    const elt2 = document.getElementById("b2");
    if (elt2 !== null && isButton(elt2)) {
        button2 = elt2;
    }
    a = {} as A;
    a.foo = jest.fn();
});

afterEach(() => {
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    if (binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("commandExecutedOnSingleButton", () => {
    binding = anonCmdBinder(() => a.foo())
        .usingInteraction(() => new ButtonPressed())
        .on(button1)
        .bind();

    button1.click();
    expect(a.foo).toHaveBeenCalledTimes(1);
    expect(binding).not.toBeUndefined();
    expect(binding.getInteraction().preventDefault).toBeFalsy();
    expect(binding.getInteraction().stopImmediatePropagation).toBeFalsy();
});

test("commandExecutedOnTwoButtons", () => {
    binding = anonCmdBinder(() => a.foo())
        .usingInteraction(() => new ButtonPressed())
        .on(button1, button2)
        .bind();

    button1.click();
    button2.click();
    button2.click();
    expect(a.foo).toHaveBeenCalledTimes(3);
    expect(binding).not.toBeUndefined();
});

test("differentOrderBuilder", () => {
    let cpt = 0;

    binding = anonCmdBinder(() => cpt++)
        .on(button1, button1)
        .usingInteraction(() => new ButtonPressed())
        .bind();

    button1.click();
    expect(cpt).toStrictEqual(1);
    expect(binding).not.toBeUndefined();
});

test("prevent default set", () => {
    binding = anonCmdBinder(() => a.foo())
        .usingInteraction(() => new ButtonPressed())
        .on(button1)
        .preventDefault()
        .bind();

    expect(binding.getInteraction().preventDefault).toBeTruthy();
    expect(binding.getInteraction().stopImmediatePropagation).toBeFalsy();
    expect(binding).not.toBeUndefined();
});

test("stop propag set", () => {
    binding = anonCmdBinder(() => a.foo())
        .usingInteraction(() => new ButtonPressed())
        .on(button1)
        .stopImmediatePropagation()
        .bind();

    expect(binding.getInteraction().stopImmediatePropagation).toBeTruthy();
    expect(binding.getInteraction().preventDefault).toBeFalsy();
    expect(binding).not.toBeUndefined();
});
