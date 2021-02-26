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
import type {Binding, Interaction, InteractionData, WidgetData} from "../../src/interacto";
import {BindingsImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings;

beforeEach(() => {
    bindings = new BindingsImpl();
    ctx = new BindingsContext();
    bindings.setBindingObserver(ctx);
    widget1 = document.createElement("input");
    widget2 = document.createElement("input");
    widget1.type = "date";
    widget2.type = "date";
    cmd = new StubCmd(true);
});

afterEach(() => {
    bindings.clear();
});

test("testCommandExecutedOnSingleDateFunction", () => {
    binding = bindings.dateBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoDates", () => {
    binding = bindings.dateBinder()
        .on(widget1, widget2)
        .toProduce(_i => new StubCmd(true))
        .bind();

    widget1.dispatchEvent(new Event("input"));
    widget2.dispatchEvent(new Event("input"));

    expect(binding).toBeDefined();
    expect(ctx.commands).toHaveLength(2);
});

test("testInit1Executed", () => {
    binding = bindings.dateBinder()
        .on(widget1)
        .toProduce(_i => cmd)
        .first((c: StubCmd) => {
            c.exec = 10;
        })
        .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = bindings.dateBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .when((_i: WidgetData<HTMLInputElement>) => false)
        .bind();

    widget1.dispatchEvent(new Event("input"));

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(0);
});
