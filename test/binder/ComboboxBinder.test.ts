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
import {Subscription} from "rxjs";
import {
    comboBoxBinder,
    CommandsRegistry,
    Interaction,
    InteractionData,
    UndoCollector,
    Binding,
    WidgetData
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";

let widget1: HTMLSelectElement;
let widget2: HTMLSelectElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;

beforeEach(() => {
    widget1 = document.createElement("select");
    widget2 = document.createElement("select");
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    if (binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("testCommandExecutedOnSingleComboFunction", () => {
    binding = comboBoxBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoCombos", () => {
    binding = comboBoxBinder()
        .on(widget1, widget2)
        .toProduce(_i => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    widget1.dispatchEvent(new Event("input"));
    widget2.dispatchEvent(new Event("input"));

    expect(binding).toBeDefined();
    expect(producedCmds).toHaveLength(2);
});

test("testInit1Executed", () => {
    binding = comboBoxBinder()
        .on(widget1)
        .toProduce(_i => cmd)
        .first((c: StubCmd, _i: WidgetData<HTMLSelectElement>) => {
            c.exec = 10;
        })
        .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = comboBoxBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .when((_i: WidgetData<HTMLSelectElement>) => false)
        .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(0);
});
