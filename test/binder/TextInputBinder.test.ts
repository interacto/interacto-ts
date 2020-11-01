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
    CommandsRegistry,
    Interaction,
    InteractionData,
    textInputBinder,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";

let txt1: HTMLInputElement | HTMLTextAreaElement;
let binding: WidgetBinding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;

beforeEach(() => {
    jest.useFakeTimers();
    txt1 = document.createElement("textarea");
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

test("type text create command", () => {
    const textonUpdate = Array<string>();

    // eslint-disable-next-line jest/valid-expect-in-promise
    binding = textInputBinder()
        .toProduce(() => cmd)
        .then((c, i) => {
            textonUpdate.push(i.getWidget()?.value ?? "");
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
    const textonUpdate = Array<string>();

    // eslint-disable-next-line jest/valid-expect-in-promise
    binding = textInputBinder()
        .toProduce(() => cmd)
        .then((c, i) => {
            textonUpdate.push(i.getWidget()?.value ?? "");
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
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(4);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBe(cmd);
    expect(textonUpdate).toStrictEqual(["f", "fo", "foo"]);
});
