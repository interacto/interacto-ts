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
import type {Binding, FSM, Interaction, InteractionBase, InteractionData, UndoHistoryBase} from "../../src/interacto";
import {BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Flushable} from "../../src/impl/interaction/Flushable";
import type {Bindings} from "../../src/api/binding/Bindings";
import {robot} from "interacto-nono";

let c1: HTMLElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData, unknown> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a multi touch binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        jest.useFakeTimers();
        c1 = document.createElement("canvas");
        cmd = new StubCmd(true);
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllTimers();
    });

    test("run multi-touch produces cmd", () => {
        binding = bindings.multiTouchBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchmove()
            .touchend();

        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.getCmd(0)).toBe(cmd);
    });

    test("run multi-touch two times recycle events", () => {
        const data: Array<number> = [];
        const dataFirst: Array<number> = [];

        binding = bindings.multiTouchBinder(2)
            .toProduce(() => new StubCmd(true))
            .first((_, i) => {
                dataFirst.push(i.touches.length);
            })
            .on(c1)
            .end((_, i) => {
                data.push(i.touches.length);
            })
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchmove()
            .touchend()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchend({}, [{"identifier": 1}]);

        // c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
        // c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        // c1.dispatchEvent(createTouchEvent("touchmove", 2, c1, 15, 30, 150, 300));
        // c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 15, 30, 150, 300));
        // c1.dispatchEvent(createTouchEvent("touchstart", 3, c1, 31, 13, 310, 130));
        // c1.dispatchEvent(createTouchEvent("touchmove", 3, c1, 15, 30, 150, 300));
        // c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 15, 30, 150, 300));

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
        expect(dataFirst).toHaveLength(2);
        expect(dataFirst[0]).toBe(2);
        expect(dataFirst[1]).toBe(2);
        expect(data).toHaveLength(2);
        expect(data[0]).toBe(2);
        expect(data[1]).toBe(2);
    });

    test("unsubscribe does not trigger the binding", () => {
        binding = bindings.multiTouchBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();

        (binding.interaction as InteractionBase<InteractionData, Flushable & InteractionData, FSM>).onNodeUnregistered(c1);

        robot(c1)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchend();

        expect(binding.running).toBeFalsy();
    });
});
