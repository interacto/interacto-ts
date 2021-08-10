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
import {StubCmd} from "../command/StubCmd";
import {createTouchEvent} from "../interaction/StubEvents";
import type {Binding, Interaction, InteractionData} from "../../src/interacto";
import {BindingsImpl} from "../../src/interacto";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";

let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let c1: HTMLElement;
let ctx: BindingsContext;
let bindings: Bindings;

beforeEach(() => {
    bindings = new BindingsImpl();
    ctx = new BindingsContext();
    bindings.setBindingObserver(ctx);
    jest.useFakeTimers();
    c1 = document.createElement("canvas");
});

afterEach(() => {
    bindings.clear();
    jest.clearAllTimers();
});

test("pinch OK", () => {
    binding = bindings.pinchBinder(10)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 15, 16, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchstart", 3, c1, 10, 11, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchmove", 2, c1, 20, 22, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchmove", 3, c1, 5, 6, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 20, 22, 500, 210));
    c1.dispatchEvent(createTouchEvent("touchend", 3, c1, 5, 6, 500, 210));

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toStrictEqual(0);
    expect(binding.timesEnded).toStrictEqual(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
});

test("pinch KO wrong direction", () => {
    binding = bindings.pinchBinder(10)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 15, 16, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchstart", 3, c1, 10, 11, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchmove", 2, c1, 10, 8, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchmove", 3, c1, 5, 6, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 10, 8, 500, 210));
    c1.dispatchEvent(createTouchEvent("touchend", 3, c1, 5, 6, 500, 210));

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toStrictEqual(1);
    expect(binding.timesEnded).toStrictEqual(0);
    expect(ctx.commands).toHaveLength(0);
});

test("pinch KO not enough touches", () => {
    binding = bindings.pinchBinder(10)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 15, 16, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchmove", 2, c1, 20, 22, 100, 200));
    c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 20, 22, 500, 210));

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toStrictEqual(0);
    expect(binding.timesEnded).toStrictEqual(0);
    expect(ctx.commands).toHaveLength(0);
});
