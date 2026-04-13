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
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import type {WidgetData, LinearHistoryBase, Bindings} from "../../src/interacto";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<LinearHistoryBase>;

describe("using a date binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new LinearHistoryImpl());
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

        bindings.dateBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .bind();

        robot(widget1).input();
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("commandExecutedOnTwoDates", () => {
        bindings.dateBinder()
            .on(widget1, widget2)
            .toProduce(_i => new StubCmd(true))
            .bind();

        robot(widget1).input();
        robot(widget2).input();

        expect(ctx.commands).toHaveLength(2);
    });

    test("init1Executed", () => {
        jest.spyOn(cmd, "execute");

        bindings.dateBinder()
            .on(widget1)
            .toProduce(_i => cmd)
            .first((c: StubCmd) => {
                c.value = 10;
            })
            .bind();

        robot(widget1).input();

        expect(cmd.value).toBe(10);
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("checkFalse", () => {
        jest.spyOn(cmd, "execute");

        bindings.dateBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .when((_i: WidgetData<HTMLInputElement>) => false)
            .bind();

        robot(widget1).input();

        expect(cmd.execute).not.toHaveBeenCalled();
    });
});
