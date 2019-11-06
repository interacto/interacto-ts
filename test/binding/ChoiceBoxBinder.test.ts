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
import { WidgetData, WidgetBinding, CommandsRegistry, UndoCollector, ChoiceBoxSelected, choiceBoxBinder } from "../../src";
import { StubCmd } from "../command/StubCmd";
import { Subscription } from "rxjs";

let widget1: HTMLElement;
let widget2: HTMLElement;
let binding: WidgetBinding<StubCmd, ChoiceBoxSelected, WidgetData<Element>>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    document.documentElement.innerHTML =
        "<html><div>" +
        "<select id='sel1'><option value='test'>Test</option>" +
        "<option value='Test2'>Test2</option></select>" +
        "<select id='sel2'><option value='test'>Test</option>" +
        "<option value='Test2'>Test2</option></select></datalist></div></html>";
    const elt1 = document.getElementById("sel1");
    if (elt1 !== null) {
        widget1 = elt1;
    }
    const elt2 = document.getElementById("sel2");
    if (elt2 !== null) {
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
});

test("testCommandExecutedOnSingleChoiceFunction", () => {
    binding = choiceBoxBinder()
                .toProduce(i => cmd)
                .on(widget1)
                .bind();

    widget1.dispatchEvent(new Event("input"));
    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(1);
});

test("testCommandExecutedOnTwoChoices", () => {
    binding = choiceBoxBinder()
                .on(widget1, widget2)
                .toProduce(i => new StubCmd(true))
                .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    widget1.dispatchEvent(new Event("input"));
    widget2.dispatchEvent(new Event("input"));

    expect(binding).not.toBeNull();
    expect(producedCmds.length).toEqual(2);
});

test("testInit1Executed", () => {
    binding = choiceBoxBinder()
                .on(widget1)
                .toProduce(i => cmd)
                .first(c => c.exec = 10)
                .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(11);
});

test("testCheckFalse", () => {
    binding = choiceBoxBinder()
                .toProduce(i => cmd)
                .on(widget1)
                .when(i => false)
                .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(0);
});
