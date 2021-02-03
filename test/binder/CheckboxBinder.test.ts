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
import {Subscription} from "rxjs";
import {
    checkboxBinder,
    CommandsRegistry,
    Interaction,
    InteractionData,
    UndoHistory,
    Binding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;

beforeEach(() => {
    widget1 = document.createElement("input");
    widget2 = document.createElement("input");
    widget1.type = "checkbox";
    widget2.type = "checkbox";
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    CommandsRegistry.getInstance().clear();
    UndoHistory.getInstance().clear();
    if (binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("testCommandExecutedOnSingleButtonFunction", () => {
    binding = checkboxBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .bind();

    widget1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnSingleButtonSupplier", () => {
    binding = checkboxBinder()
        .toProduce(() => cmd)
        .on(widget1)
        .bind();

    widget1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoCheckboxes", () => {
    binding = checkboxBinder()
        .toProduce(_i => new StubCmd(true))
        .on(widget1, widget2)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    widget2.click();
    widget1.click();
    expect(binding).toBeDefined();
    expect(producedCmds).toHaveLength(2);
});

test("testInit1Executed", () => {
    binding = checkboxBinder()
        .toProduce(_i => cmd)
        .first(c => {
            c.exec = 10;
        })
        .on(widget1)
        .bind();

    widget1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testInit2Executed", () => {
    binding = checkboxBinder()
        .toProduce(() => cmd)
        .on(widget1)
        .first((c, _i) => {
            c.exec = 10;
        })
        .bind();

    widget1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = checkboxBinder()
        .on(widget1)
        .when(_i => false)
        .toProduce(_i => cmd)
        .bind();

    widget1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(0);
});
