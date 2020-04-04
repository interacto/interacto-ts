/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Subscription } from "rxjs";
import { ColorPicked, colorPickerBinder, CommandsRegistry, isColorChoice, UndoCollector, WidgetBinding, WidgetData } from "../../src/interacto";
import { StubCmd } from "../command/StubCmd";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: WidgetBinding<StubCmd, ColorPicked, WidgetData<HTMLInputElement>>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    document.documentElement.innerHTML =
        "<html><div><input id='col1' type='color'/><input id='col2' type='color'/></div></html>";
    const elt1 = document.getElementById("col1");
    if (elt1 !== null && isColorChoice(elt1)) {
        widget1 = elt1;
    }
    const elt2 = document.getElementById("col2");
    if (elt2 !== null && isColorChoice(elt2)) {
        widget2 = elt2;
    }
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    if(binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("testCommandExecutedOnSinglePickerFunction", () => {
    binding = colorPickerBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoPickers", () => {
    binding = colorPickerBinder()
        .on(widget1, widget2)
        .toProduce(_i => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    widget1.dispatchEvent(new Event("input"));
    widget2.dispatchEvent(new Event("input"));

    expect(binding).not.toBeNull();
    expect(producedCmds).toHaveLength(2);
});

test("testInit1Executed", () => {
    binding = colorPickerBinder()
        .on(widget1)
        .toProduce(_i => cmd)
        .first(c => c.exec = 10)
        .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = colorPickerBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .when(_i => false)
        .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(0);
});
