/* eslint-disable jest/no-commented-out-tests */
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
import {BindingsContext, BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {robot} from "../interaction/StubEvents";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {Binding, Bindings, FSMHandler, Interaction, SrcTgtPointsData, TouchData, UndoHistoryBase} from "../../src/interacto";

let binding: Binding<StubCmd, Interaction<SrcTgtPointsData<TouchData>>, unknown> | undefined;
let c1: HTMLElement;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a swipe binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        jest.useFakeTimers();
        c1 = document.createElement("canvas");
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllTimers();
    });

    test("touch move: too slow too short", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 150, "clientY": 200}], 100)
            .touchmove({}, [{"identifier": 3, "screenX": 16, "screenY": 30, "clientX": 160, "clientY": 201}], 2000);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test.each([20, -30])("touch move KO not horizontal enough with %s", y => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 150, "clientY": 200}], 10)
            .touchmove({}, [{"identifier": 3, "screenX": 16, "screenY": 20 + y, "clientX": 160, "clientY": 200 + y}], 10);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test.each([40, -50])("touch move move release not horizontal enough with %s", y => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 150, "screenY": 20, "clientX": 150, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 20, "clientX": 200, "clientY": 200}], 5500)
            .touchmove({}, [{"identifier": 3, "screenX": 350, "screenY": 20 + y, "clientX": 250, "clientY": 200 + y}], 6000)
            .touchend({}, [{"identifier": 3, "screenX": 350, "screenY": 20 + y, "clientX": 250, "clientY": 200 + y}], 6000);

        expect(binding).toBeDefined();
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test("touch move move too short too slow", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 100, "screenY": 20, "clientX": 150, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 200, "screenY": 30, "clientX": 160, "clientY": 201}], 5200)
            .touchmove({}, [{"identifier": 3, "screenX": 299, "screenY": 30, "clientX": 349, "clientY": 210}], 5399);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test("touch move move too short velocity OK", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 150, "screenY": 20, "clientX": 150, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 20, "clientX": 160, "clientY": 201}], 5050)
            .touchmove({}, [{"identifier": 3, "screenX": 200, "screenY": 30, "clientX": 200, "clientY": 210}], 5100);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test("touch move move distance OK short too slow", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 150, "screenY": 20, "clientX": 150, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201}], 6000)
            .touchmove({}, [{"identifier": 3, "screenX": 350, "screenY": 30, "clientX": 350, "clientY": 210}], 7000);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test("touch move move release distance velocity OK 1s", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201}], 5500)
            .touchmove({}, [{"identifier": 3, "screenX": 250, "screenY": 30, "clientX": 500, "clientY": 210}], 6000)
            .touchend({}, [{"identifier": 3, "screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210}], 6000);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("swipe starts but another touch occurs cancels the interaction", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        const newHandler = mock<FSMHandler>();
        binding.interaction.fsm.addHandler(newHandler);

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201}], 5500)
            .touchstart({}, [{"identifier": 2, "screenX": 260, "screenY": 30, "clientX": 160, "clientY": 201}], 5550)
            .touchmove({}, [{"identifier": 3, "screenX": 250, "screenY": 30, "clientX": 500, "clientY": 210}], 6000)
            .touchend({}, [{"identifier": 3, "screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210}], 6000);

        expect(ctx.commands).toHaveLength(0);
        expect(newHandler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(newHandler.fsmStops).not.toHaveBeenCalled();
    });

    test("one touch and then swipes does not swipe", () => {
        binding = bindings.panHorizontalBinder(10, false, 400, 200)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"identifier": 2}], 4000)
            .touchstart({}, [{"identifier": 3, "screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200}], 5000)
            .touchmove({}, [{"screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201}], 5500)
            .touchmove({}, [{"screenX": 250, "screenY": 30, "clientX": 500, "clientY": 210}], 6000)
            .touchend({}, [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210}], 6000);

        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test("touch move move release distance velocity OK 200 px/s", () => {
        binding = bindings.panHorizontalBinder(10, false, 200, 400)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 3, "screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200}], 5000)
            .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201}], 5200)
            .touchmove({}, [{"identifier": 3, "screenX": 250, "screenY": 30, "clientX": 300, "clientY": 210}], 5500)
            .touchend({}, [{"identifier": 3, "screenX": 250, "screenY": 30, "clientX": 300, "clientY": 210}], 5500);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });
});
