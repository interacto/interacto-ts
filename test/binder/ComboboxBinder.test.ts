/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */
import {BindingsContext, BindingsImpl, LinearHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {afterEach, beforeEach, describe, expect, vi, test} from "vitest";
import {robot} from "interacto-nono";
import type {WidgetData, LinearHistoryBase, Bindings} from "../../src/interacto";

let widget1: HTMLSelectElement;
let widget2: HTMLSelectElement;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<LinearHistoryBase>;

describe("using a combobox binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new LinearHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        widget1 = document.createElement("select");
        widget2 = document.createElement("select");
        cmd = new StubCmd(true);
    });

    afterEach(() => {
        bindings.clear();
        vi.clearAllMocks();
    });

    test("commandExecutedOnSingleComboFunction", () => {
        vi.spyOn(cmd, "execute");

        bindings.comboBoxBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .bind();

        robot(widget1).input();
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("commandExecutedOnTwoCombos", () => {
        bindings.comboBoxBinder()
            .on(widget1, widget2)
            .toProduce(_i => new StubCmd(true))
            .bind();

        robot(widget1).input();
        robot(widget2).input();

        expect(ctx.commands).toHaveLength(2);
    });

    test("init1Executed", () => {
        vi.spyOn(cmd, "execute");

        bindings.comboBoxBinder()
            .on(widget1)
            .toProduce(_i => cmd)
            .first((c: StubCmd, _i: WidgetData<HTMLSelectElement>) => {
                c.value = 10;
            })
            .bind();

        robot(widget1).input();

        expect(cmd.value).toBe(10);
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("checkFalse", () => {
        vi.spyOn(cmd, "execute");

        bindings.comboBoxBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .when((_i: WidgetData<HTMLSelectElement>) => false)
            .bind();

        robot(widget1).input();

        expect(cmd.execute).not.toHaveBeenCalled();
    });
});
