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
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import type {Binding, Interaction, InteractionBase, UndoHistoryBase, Bindings, Flushable} from "../../src/interacto";

let binding: Binding<StubCmd, Interaction<object>, unknown> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a tap binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        jest.useFakeTimers();
        cmd = new StubCmd(true);
    });

    afterEach(() => {
        jest.clearAllTimers();
        bindings.clear();
    });

    describe("on canvas", () => {
        let c1: HTMLElement;

        beforeEach(() => {
            c1 = document.createElement("canvas");
        });

        test("run tap produces cmd", () => {
            jest.spyOn(cmd, "execute");

            binding = bindings.tapsBinder(2)
                .toProduce(() => cmd)
                .on(c1)
                .bind();

            robot(c1)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding).toBeDefined();
            expect(cmd.execute).toHaveBeenCalledTimes(1);
            expect(ctx.commands).toHaveLength(1);
            expect(ctx.getCmd(0)).toBe(cmd);
        });

        test("run tap two times recycle events", () => {
            binding = bindings.tapsBinder(2)
                .toProduce(() => new StubCmd(true))
                .on(c1)
                .bind();

            robot(c1)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend()
                .touchstart({}, [{"identifier": 3}])
                .touchend()
                .touchstart({}, [{"identifier": 4}])
                .touchend()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(2);
        });

        test("unsubscribe does not trigger the binding", () => {
            binding = bindings.tapsBinder(2)
                .toProduce(() => cmd)
                .on(c1)
                .bind();

            (binding.interaction as InteractionBase<object, Flushable & object>).onNodeUnregistered(c1);

            robot(c1)
                .keepData()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding.running).toBeFalsy();
        });
    });

    describe("on svg doc for dynamic registration", () => {
        let doc: HTMLElement;

        beforeEach(() => {
            doc = document.createElement("svg");
        });

        test("dynamic registration with nothing added", () => {
            binding = bindings.tapsBinder(2)
                .toProduce(() => cmd)
                .onDynamic(doc)
                .bind();

            robot(doc)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend();

            expect(binding.running).toBeFalsy();
            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });

        test("dynamic registration with a node added", async () => {
            binding = bindings.tapsBinder(2)
                .toProduce(() => cmd)
                .onDynamic(doc)
                .bind();

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            doc.append(rect);

            // Waiting for the mutation changes to be done.
            await Promise.resolve();

            robot(rect)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(1);
        });

        test("dynamic registration with a node already added", async () => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            doc.append(rect);

            // Waiting for the mutation changes to be done.
            await Promise.resolve();

            binding = bindings.tapsBinder(2)
                .toProduce(() => cmd)
                .onDynamic(doc)
                .bind();

            robot(rect)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(1);
        });

        test("dynamic registration with a node added and removed", async () => {
            binding = bindings.tapsBinder(1)
                .toProduce(() => cmd)
                .onDynamic(doc)
                .bind();

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            doc.append(rect);
            await Promise.resolve();

            rect.remove();
            await Promise.resolve();

            robot(rect)
                .keepData()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });

        test("dynamic registration with a node already added then removed", async () => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            doc.append(rect);
            await Promise.resolve();

            binding = bindings.tapsBinder(3)
                .toProduce(() => cmd)
                .onDynamic(doc)
                .bind();

            rect.remove();
            await Promise.resolve();

            robot(rect)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend()
                .touchstart({}, [{"identifier": 3}])
                .touchend()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });
    });
});
