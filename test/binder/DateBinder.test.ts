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
import type {Binding, Interaction, InteractionData, WidgetData, UndoHistoryBase} from "../../src/interacto";
import {BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";
import {robot} from "interacto-nono";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, unknown> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a date binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
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
        jest.clearAllMocks();
    });

    test("commandExecutedOnSingleDateFunction", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.dateBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .bind();

        robot(widget1).input();
        expect(binding).toBeDefined();
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("commandExecutedOnTwoDates", () => {
        binding = bindings.dateBinder()
            .on(widget1, widget2)
            .toProduce(_i => new StubCmd(true))
            .bind();

        robot(widget1).input();
        robot(widget2).input();

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
    });

    test("init1Executed", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.dateBinder()
            .on(widget1)
            .toProduce(_i => cmd)
            .first((c: StubCmd) => {
                c.value = 10;
            })
            .bind();

        robot(widget1).input();

        expect(binding).toBeDefined();
        expect(cmd.value).toBe(10);
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("checkFalse", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.dateBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .when((_i: WidgetData<HTMLInputElement>) => false)
            .bind();

        robot(widget1).input();

        expect(binding).toBeDefined();
        expect(cmd.execute).not.toHaveBeenCalled();
    });
});
