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
import type {Binding, Interaction, InteractionData, UndoHistoryBase} from "../../src/interacto";
import {BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";
import {robot} from "interacto-nono";

let binding: Binding<StubCmd, Interaction<InteractionData>, unknown> | undefined;
let c1: HTMLElement;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using pan binders", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        c1 = document.createElement("canvas");
    });

    afterEach(() => {
        bindings.clear();
    });

    test("horizontal pan", () => {
        binding = bindings.panHorizontalBinder(5, false, 50)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"screenX": 3, "screenY": 20, "clientX": 150, "clientY": 200, "identifier": 3, "target": c1}])
            .touchmove({}, [{"screenX": -100, "screenY": 21, "clientX": -1000, "clientY": 201}])
            .touchmove({}, [{"screenX": 16, "screenY": 21, "clientX": 160, "clientY": 201}])
            .touchmove({}, [{"screenX": 20, "screenY": 25, "clientX": 200, "clientY": 205}])
            .touchend({}, [{"screenX": 65, "screenY": 25, "clientX": 200, "clientY": 205}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("right pan", () => {
        binding = bindings.panRightBinder(5, false, 50)
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

    test("left pan", () => {
        binding = bindings.panLeftBinder(5, false, 50)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"screenX": 65, "screenY": 20, "clientX": 150, "clientY": 200, "identifier": 3}])
            .touchmove({}, [{"screenX": 20, "screenY": 19, "clientX": 140, "clientY": 199}])
            .touchmove({}, [{"screenX": 17, "screenY": 15, "clientX": 100, "clientY": 195}])
            .touchend({}, [{"screenX": 15, "screenY": 15, "clientX": 100, "clientY": 195}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("vertical pan", () => {
        binding = bindings.panVerticalBinder(5, false, 10)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"screenX": 10, "screenY": 20, "clientX": 110, "clientY": 230, "identifier": 1}])
            .touchmove({}, [{"screenX": 10, "screenY": 25, "clientX": 110, "clientY": 233}])
            .touchmove({}, [{"screenX": 10, "screenY": 30, "clientX": 110, "clientY": 240}])
            .touchend({}, [{"screenX": 10, "screenY": 30, "clientX": 110, "clientY": 240}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("bottom pan", () => {
        binding = bindings.panBottomBinder(5, false, 100)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"screenX": 10, "screenY": 200, "clientX": 110, "clientY": 2300, "identifier": 1}])
            .touchmove({}, [{"screenX": 10, "screenY": 250, "clientX": 110, "clientY": 2330}])
            .touchmove({}, [{"screenX": 11, "screenY": 300, "clientX": 111, "clientY": 2400}])
            .touchend({}, [{"screenX": 11, "screenY": 300, "clientX": 111, "clientY": 2400}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("top pan", () => {
        binding = bindings.panTopBinder(5, false, 100)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"screenX": 10, "screenY": 200, "clientX": 110, "clientY": 200, "identifier": 1}])
            .touchmove({}, [{"screenX": 10, "screenY": 150, "clientX": 110, "clientY": 150}])
            .touchmove({}, [{"screenX": 11, "screenY": 100, "clientX": 111, "clientY": 100}])
            .touchend({}, [{"screenX": 11, "screenY": 100, "clientX": 111, "clientY": 100}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("pan", () => {
        binding = bindings.panBinder(false)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"screenX": 3, "screenY": 20, "clientX": 150, "clientY": 200, "identifier": 3, "target": c1}])
            .touchmove({}, [{"screenX": 10, "screenY": 150, "clientX": 110, "clientY": 150}])
            .touchmove({}, [{"screenX": 10, "screenY": 250, "clientX": 110, "clientY": 2330}])
            .touchmove({}, [{"screenX": 16, "screenY": 21, "clientX": 160, "clientY": 201}])
            .touchend({}, [{"screenX": 16, "screenY": 21, "clientX": 160, "clientY": 201}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });
});
