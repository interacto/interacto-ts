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
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import type {Binding, Interaction, InteractionBase, UndoHistoryBase, MultiTouch, Bindings, Flushable} from "../../src/interacto";

let c1: HTMLElement;
let binding: Binding<StubCmd, Interaction<object>, unknown> | undefined;
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
        jest.spyOn(cmd, "execute");

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
        expect(cmd.execute).toHaveBeenCalledTimes(1);
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

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
        expect(dataFirst).toHaveLength(2);
        expect(dataFirst[0]).toBe(2);
        expect(dataFirst[1]).toBe(2);
        expect(data).toHaveLength(2);
        expect(data[0]).toBe(2);
        expect(data[1]).toBe(2);
    });

    test("clear data", () => {
        binding = bindings.multiTouchBinder(2)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();

        robot(c1)
            .keepData()
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchmove()
            .touchend()
            .touchend({}, [{"identifier": 1}]);

        const interaction = binding.interaction as MultiTouch;
        expect(interaction.data.touches).toHaveLength(0);
    });

    test("unsubscribe does not trigger the binding", () => {
        binding = bindings.multiTouchBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();

        (binding.interaction as InteractionBase<object, Flushable & object>).onNodeUnregistered(c1);

        robot(c1)
            .touchstart({}, [{"identifier": 1}])
            .touchstart({}, [{"identifier": 2}])
            .touchend();

        expect(binding.running).toBeFalsy();
    });
});
