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
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import {BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {robot} from "interacto-nono";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {Binding, Interaction, InteractionData, UndoHistoryBase} from "../../src/interacto";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, unknown> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a checkbox binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        widget1 = document.createElement("input");
        widget2 = document.createElement("input");
        widget1.type = "checkbox";
        widget2.type = "checkbox";
        cmd = new StubCmd(true);
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllMocks();
    });

    test("commandExecutedOnSingleButtonFunction", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.checkboxBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .bind();

        robot(widget1).input();
        expect(binding).toBeDefined();
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("commandExecutedOnSingleButtonSupplier", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.checkboxBinder()
            .toProduce(() => cmd)
            .on(widget1)
            .bind();

        robot(widget1).input();
        expect(binding).toBeDefined();
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("commandExecutedOnTwoCheckboxes", () => {
        binding = bindings.checkboxBinder()
            .toProduce(_i => new StubCmd(true))
            .on(widget1, widget2)
            .bind();

        robot(widget2).input();
        robot(widget1).input();
        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
    });

    test("init1Executed", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.checkboxBinder()
            .toProduce(_i => cmd)
            .first(c => {
                c.value = 10;
            })
            .on(widget1)
            .bind();

        robot(widget1).input();
        expect(binding).toBeDefined();
        expect(cmd.value).toBe(10);
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("init2Executed", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.checkboxBinder()
            .toProduce(() => cmd)
            .on(widget1)
            .first((c, _i) => {
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

        binding = bindings.checkboxBinder()
            .on(widget1)
            .when(_i => false)
            .toProduce(_i => cmd)
            .bind();

        robot(widget1).input();
        expect(binding).toBeDefined();
        expect(cmd.execute).not.toHaveBeenCalled();
    });
});
