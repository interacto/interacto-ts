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
import {createTouchEvent} from "../interaction/StubEvents";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {Flushable} from "../../src/impl/interaction/Flushable";
import type {Binding, FSM, Interaction, InteractionBase, InteractionData, UndoHistoryBase} from "../../src/interacto";

let binding: Binding<StubCmd, Interaction<InteractionData>, unknown> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a long touch binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        jest.useFakeTimers();
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllTimers();
    });

    describe("on canvas", () => {
        let c1: HTMLElement;

        beforeEach(() => {
            c1 = document.createElement("canvas");
        });

        test("run long touch produces cmd", () => {
            binding = bindings.longTouchBinder(1000)
                .toProduce(() => new StubCmd(true))
                .on(c1)
                .bind();

            c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
            jest.runOnlyPendingTimers();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(1);
            expect(ctx.getCmd(0)).toBeInstanceOf(StubCmd);
        });

        test("tap does not produce long touch", () => {
            binding = bindings.longTouchBinder(1000)
                .toProduce(() => new StubCmd(true))
                .on(c1)
                .log("interaction")
                .bind();

            c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
            c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
            jest.runOnlyPendingTimers();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });

        test("run long touch two times recycle events", () => {
            binding = bindings.longTouchBinder(150)
                .toProduce(() => new StubCmd(true))
                .on(c1)
                .bind();

            c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
            jest.runOnlyPendingTimers();

            c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
            jest.runOnlyPendingTimers();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(2);
        });

        test("unsubscribe does not trigger the binding", () => {
            binding = bindings.longTouchBinder(2000)
                .toProduce(() => cmd)
                .on(c1)
                .bind();

            (binding.interaction as InteractionBase<InteractionData, Flushable & InteractionData, FSM>).onNodeUnregistered(c1);

            c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));

            expect(binding.running).toBeFalsy();
        });
    });

    describe("on svg doc for dynamic registration", () => {
        let doc: HTMLElement;

        beforeEach(() => {
            doc = document.createElement("svg");
        });

        test("tap does not produce long touch on dynamic array", async () => {
            binding = bindings.longTouchBinder(1000)
                .toProduce(() => new StubCmd(true))
                .onDynamic(doc)
                .log("interaction")
                .bind();

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            doc.append(rect);

            // Waiting for the mutation changes to be done.
            await Promise.resolve();

            rect.dispatchEvent(createTouchEvent("touchstart", 1, rect, 11, 23, 110, 230));
            rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
            jest.runOnlyPendingTimers();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });

        test("tap does not produce long touch on dynamic array 2", async () => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            doc.append(rect);

            // Waiting for the mutation changes to be done.
            await Promise.resolve();

            binding = bindings.longTouchBinder(1000)
                .toProduce(() => new StubCmd(true))
                .onDynamic(doc)
                .log("interaction")
                .bind();

            rect.dispatchEvent(createTouchEvent("touchstart", 1, rect, 11, 23, 110, 230));
            rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
            jest.runOnlyPendingTimers();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });
    });
});
