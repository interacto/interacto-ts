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
import type {Binding, Interaction, InteractionData, UndoHistoryBase} from "../../src/interacto";
import {BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";
import {robot} from "interacto-nono";

let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let c1: HTMLElement;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

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

test("pan horizontal right", () => {
    binding = bindings.panBinder(true, 50, 1, 5)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    robot(c1)
        .keepData()
        .touchstart({}, [{"screenX": 3, "screenY": 20, "clientX": 150, "clientY": 200, "identifier": 3, "target": c1}])
        .touchmove({}, [{"screenX": 16, "screenY": 21, "clientX": 160, "clientY": 201}])
        .touchmove({}, [{"screenX": 20, "screenY": 25, "clientX": 200, "clientY": 205}])
        .touchend({}, [{"screenX": 65, "screenY": 25, "clientX": 200, "clientY": 205}]);

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toBe(0);
    expect(binding.timesEnded).toBe(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
});

test("pan horizontal left", () => {
    binding = bindings.panBinder(true, 50, 1, 5)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    c1.dispatchEvent(createTouchEvent("touchstart", 3, c1, 65, 20, 150, 200));
    c1.dispatchEvent(createTouchEvent("touchmove", 3, c1, 20, 19, 140, 199));
    c1.dispatchEvent(createTouchEvent("touchmove", 3, c1, 17, 15, 100, 195));
    c1.dispatchEvent(createTouchEvent("touchend", 3, c1, 15, 15, 100, 195));

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toBe(0);
    expect(binding.timesEnded).toBe(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
});


test("pan vertical up", () => {
    binding = bindings.panBinder(false, 10, 1, 0)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 10, 20, 110, 230));
    c1.dispatchEvent(createTouchEvent("touchmove", 1, c1, 10, 25, 110, 233));
    c1.dispatchEvent(createTouchEvent("touchmove", 1, c1, 10, 30, 110, 240));
    c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 10, 30, 110, 240));

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toBe(0);
    expect(binding.timesEnded).toBe(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
});

test("pan vertical down", () => {
    binding = bindings.panBinder(false, 100, 1, 1)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();

    c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 10, 200, 110, 2300));
    c1.dispatchEvent(createTouchEvent("touchmove", 1, c1, 10, 250, 110, 2330));
    c1.dispatchEvent(createTouchEvent("touchmove", 1, c1, 11, 300, 111, 2400));
    c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 300, 111, 2400));

    expect(binding).toBeDefined();
    expect(binding.timesCancelled).toBe(0);
    expect(binding.timesEnded).toBe(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
});
