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
import { Subscription } from "rxjs";
import { CommandsRegistry, UndoCollector, WidgetBinding,
    WidgetData, isTextInput, TextInputChanged, textInputBinder, WidgetDataImpl } from "../../src/interacto";
import { StubCmd } from "../command/StubCmd";

let txt1: HTMLInputElement | HTMLTextAreaElement;
let binding: WidgetBinding<StubCmd, TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    jest.useFakeTimers();
    document.documentElement.innerHTML = "<html><div><textarea id='txt1'/><textarea id='txt2'/></div></html>";
    const elt1 = document.getElementById("txt1");
    if (elt1 !== null && isTextInput(elt1)) {
        txt1 = elt1;
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

test("type text create command", () => {
    const textonUpdate = Array<string>()

    binding = textInputBinder()
        .toProduce(() => cmd)
        .then((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(WidgetDataImpl);
            textonUpdate.push(txt1.value);
        })
        .on(txt1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    txt1.value = "f";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "fo";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "foo";
    txt1.dispatchEvent(new InputEvent("input"));
    jest.runOnlyPendingTimers();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBe(cmd);
    expect(textonUpdate).toStrictEqual(["f", "fo", "foo", "foo"]);
});

test("type text exec several times the command", () => {
    const textonUpdate = Array<string>()

    binding = textInputBinder()
        .toProduce(() => cmd)
        .then((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(WidgetDataImpl);
            textonUpdate.push(txt1.value);
        })
        .on(txt1)
        .continuousExecution()
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    txt1.value = "f";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "fo";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "foo";
    txt1.dispatchEvent(new InputEvent("input"));
    jest.runOnlyPendingTimers();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(4);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBe(cmd);
    expect(textonUpdate).toStrictEqual(["f", "fo", "foo"]);
});
