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
import {robot} from "../interaction/StubEvents";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {Binding, Interaction, InteractionData, UndoHistoryBase} from "../../src/interacto";

let binding: Binding<StubCmd, Interaction<InteractionData>, unknown> | undefined;
let c1: HTMLElement;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a pinch binder", () => {
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

    test("pinch OK", () => {
        binding = bindings.scaleBinder(10)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 2, "screenX": 15, "screenY": 16, "clientX": 100, "clientY": 200}])
            .touchstart({}, [{"identifier": 3, "screenX": 10, "screenY": 11, "clientX": 100, "clientY": 200}])
            .touchmove({}, [{"identifier": 2, "screenX": 20, "screenY": 22, "clientX": 100, "clientY": 200}])
            .touchmove({}, [{"identifier": 3, "screenX": 5, "screenY": 6, "clientX": 100, "clientY": 200}])
            .touchend({}, [{"identifier": 2, "screenX": 20, "screenY": 22, "clientX": 500, "clientY": 210}])
            .touchend({}, [{"identifier": 3, "screenX": 5, "screenY": 6, "clientX": 500, "clientY": 210}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
    });

    test("pinch KO wrong direction", () => {
        binding = bindings.scaleBinder(10)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 2, "screenX": 15, "screenY": 16, "clientX": 100, "clientY": 200}])
            .touchstart({}, [{"identifier": 3, "screenX": 10, "screenY": 11, "clientX": 100, "clientY": 200}])
            .touchmove({}, [{"identifier": 2, "screenX": 10, "screenY": 8, "clientX": 100, "clientY": 200}])
            .touchmove({}, [{"identifier": 3, "screenX": 5, "screenY": 6, "clientX": 100, "clientY": 200}])
            .touchend({}, [{"identifier": 2, "screenX": 10, "screenY": 8, "clientX": 500, "clientY": 210}])
            .touchend({}, [{"identifier": 3, "screenX": 5, "screenY": 6, "clientX": 500, "clientY": 210}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(1);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });

    test("pinch KO not enough touches", () => {
        binding = bindings.scaleBinder(10)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .touchstart({}, [{"identifier": 2, "screenX": 15, "screenY": 16, "clientX": 100, "clientY": 200}])
            .touchmove({}, [{"identifier": 2, "screenX": 20, "screenY": 22, "clientX": 100, "clientY": 200}])
            .touchend({}, [{"identifier": 2, "screenX": 20, "screenY": 22, "clientX": 500, "clientY": 210}]);

        expect(binding).toBeDefined();
        expect(binding.timesCancelled).toBe(0);
        expect(binding.timesEnded).toBe(0);
        expect(ctx.commands).toHaveLength(0);
    });
});
