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
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import {BindingsImpl, SpinnerChangedFSM, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {Binding, Interaction, WidgetData, UndoHistoryBase} from "../../src/interacto";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: Binding<StubCmd, Interaction<object>, unknown> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a spinner binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        jest.useFakeTimers();
        widget1 = document.createElement("input");
        widget2 = document.createElement("input");
        widget1.type = "number";
        widget2.type = "number";
        cmd = new StubCmd(true);
    });

    afterEach(() => {
        jest.clearAllTimers();
        bindings.clear();
    });

    test("commandExecutedOnSingleSpinnerFunction", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.spinnerBinder()
            .toProduce((_i: WidgetData<HTMLInputElement>) => cmd)
            .on(widget1)
            .bind();

        robot(widget1).input();
        jest.runAllTimers();
        expect(binding).toBeDefined();
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("commandExecutedOnTwoSpinners", () => {
        binding = bindings.spinnerBinder()
            .on(widget1, widget2)
            .toProduce((_i: WidgetData<HTMLInputElement>) => new StubCmd(true))
            .bind();

        robot(widget1).input();
        jest.runAllTimers();
        robot(widget2).input();
        jest.runAllTimers();

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
    });

    test("init1Executed", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.spinnerBinder()
            .on(widget1)
            .toProduce(_i => cmd)
            .first((c: StubCmd) => {
                c.value = 10;
            })
            .bind();

        robot(widget1).input();
        jest.runAllTimers();

        expect(binding).toBeDefined();
        expect(cmd.value).toBe(10);
        expect(cmd.execute).toHaveBeenCalledTimes(1);
    });

    test("checkFalse", () => {
        jest.spyOn(cmd, "execute");

        binding = bindings.spinnerBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .when(_i => false)
            .bind();

        robot(widget1).input();
        jest.runAllTimers();
        expect(binding).toBeDefined();
        expect(cmd.execute).not.toHaveBeenCalled();
    });

    test("endsOnThen", () => {
        let cpt = 0;
        jest.spyOn(cmd, "execute");

        binding = bindings.spinnerBinder()
            .toProduce(_i => cmd)
            .on(widget1)
            .then((c: StubCmd) => {
                // checking that its compiles
                c.value = 10;
                cpt++;
            })
            .end(() => {})
            .bind();

        robot(widget1).input();
        jest.runAllTimers();

        expect(cmd.value).toBe(10);
        expect(cmd.execute).toHaveBeenCalledTimes(1);
        expect(cpt).toBe(2);
    });

    test("continuousThen", () => {
        let cpt = 0;

        binding = bindings.spinnerBinder()
            .toProduce((_i: WidgetData<HTMLInputElement>) => cmd)
            .on(widget1)
            .then((_c, _i) => cpt++)
            .end((_c, _i) => {})
            .bind();

        robot(widget1).input();
        robot(widget1).input();
        robot(widget1).input();
        robot(widget1).input();
        jest.runAllTimers();

        expect(cpt).toBe(5);
    });

    test("continuousThenTimeOut", () => {
        let cpt1 = 0;
        let cpt2 = 0;

        SpinnerChangedFSM.setTimeGap(2000);

        binding = bindings.spinnerBinder()
            .toProduce(_i => new StubCmd(true))
            .on(widget1)
            .first((_c, _i) => cpt1++)
            .end((_c: StubCmd) => cpt2++)
            .bind();

        robot(widget1).input();
        robot(widget1).input();
        jest.runAllTimers();

        robot(widget1).input();
        robot(widget1).input();
        jest.runAllTimers();

        expect(cpt1).toBe(2);
        expect(cpt2).toBe(2);
    });
});
