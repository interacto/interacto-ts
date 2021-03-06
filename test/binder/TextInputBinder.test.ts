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

import type {Binding, Interaction, InteractionData} from "../../src/interacto";
import {BindingsImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";

let txt1: HTMLInputElement | HTMLTextAreaElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings;

beforeEach(() => {
    bindings = new BindingsImpl();
    ctx = new BindingsContext();
    bindings.setBindingObserver(ctx);
    jest.useFakeTimers();
    txt1 = document.createElement("textarea");
    cmd = new StubCmd(true);
});

afterEach(() => {
    jest.clearAllTimers();
    bindings.clear();
});

test("type text create command", () => {
    const textonUpdate = Array<string>();

    // eslint-disable-next-line jest/valid-expect-in-promise
    binding = bindings.textInputBinder()
        .toProduce(() => cmd)
        .then((c, i) => {
            textonUpdate.push(i.widget?.value ?? "");
        })
        .on(txt1)
        .bind();

    txt1.value = "f";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "fo";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "foo";
    txt1.dispatchEvent(new InputEvent("input"));
    jest.runOnlyPendingTimers();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBe(cmd);
    expect(textonUpdate).toStrictEqual(["f", "fo", "foo", "foo"]);
});


test("type text create command with a delay of 2 seconds", () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    binding = bindings.textInputBinder(2)
        .toProduce(() => cmd)
        .on(txt1)
        .bind();

    txt1.value = "f";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "fo";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "foo";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "foo";
    txt1.dispatchEvent(new InputEvent("input"));
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBe(cmd);
});

test("type text exec several times the command", () => {
    const textonUpdate = Array<string>();

    // eslint-disable-next-line jest/valid-expect-in-promise
    binding = bindings.textInputBinder()
        .toProduce(() => cmd)
        .then((c, i) => {
            textonUpdate.push(i.widget?.value ?? "");
        })
        .on(txt1)
        .continuousExecution()
        .bind();

    txt1.value = "f";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "fo";
    txt1.dispatchEvent(new InputEvent("input"));
    txt1.value = "foo";
    txt1.dispatchEvent(new InputEvent("input"));
    jest.runOnlyPendingTimers();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(4);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBe(cmd);
    expect(textonUpdate).toStrictEqual(["f", "fo", "foo"]);
});
