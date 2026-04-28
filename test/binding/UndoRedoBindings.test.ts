/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */

import {BindingsContext, BindingsImpl, Redo, Undo, LinearHistoryImpl} from "../../src/interacto";
import {robot} from "../interaction/StubEvents";
import {afterEach, beforeEach, describe, expect, vi, test, type Mock} from "vitest";
import {mock, type MockProxy} from "vitest-mock-extended";
import type {Bindings, Undoable, LinearHistoryBase} from "../../src/interacto";

let bundo: HTMLButtonElement;
let bredo: HTMLButtonElement;
let ctx: BindingsContext;
let bindings: Bindings<LinearHistoryBase>;
let undoable: MockProxy<Undoable> & Undoable;
let fn: Mock;

describe("test history redo bindings", () => {
    beforeEach(() => {
        fn = vi.fn();
        bindings = new BindingsImpl(new LinearHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        bundo = document.createElement("button");
        bredo = document.createElement("button");
        undoable = mock<Undoable>();
    });

    afterEach(() => {
        bindings.clear();
        vi.clearAllMocks();
    });

    describe("test history bindings", () => {
        beforeEach(() => {
            undoable.undo.mockImplementation(() => {
                throw new Error("errr");
            });
            bindings.cmdhistory.add(undoable);
        });

        test("undo/redo: history crash caught in binding", () => {
            bindings
                .buttonBinder()
                .toProduce(() => new Undo(bindings.cmdhistory))
                .on(bundo)
                .catch(fn)
                .bind();

            robot(bundo).click();
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("errr"));
            expect(bindings.cmdhistory.getLastUndo()).toBeUndefined();
            expect(bindings.cmdhistory.getLastRedo()).toBe(undoable);
        });

        test("undo/redo bindings: history crash caught in binding by provided function", () => {
            bindings.undoRedoBinder(bundo, bredo, fn);

            robot(bundo).click();

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("errr"));
            expect(bindings.cmdhistory.getLastUndo()).toBeUndefined();
            expect(bindings.cmdhistory.getLastRedo()).toBe(undoable);
        });

        test("undo/redo bindings: history works correctly", () => {
            undoable.undo.mockImplementation(() => {});

            bindings.undoRedoBinder(bundo, bredo);
            robot(bundo).click();

            expect(bindings.cmdhistory.getLastUndo()).toBeUndefined();
            expect(bindings.cmdhistory.getLastRedo()).toBe(undoable);
        });
    });

    describe("test redo bindings", () => {
        beforeEach(() => {
            undoable.redo.mockImplementation(() => {
                throw new Error("err");
            });
            bindings.cmdhistory.add(undoable);
            void bindings.cmdhistory.undo();
        });

        test("undo/redo: redo crash caught in binding", () => {
            bindings
                .buttonBinder()
                .toProduce(() => new Redo(bindings.cmdhistory))
                .on(bredo)
                .catch(fn)
                .bind();

            robot(bredo).click();
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("err"));
            expect(bindings.cmdhistory.getLastRedo()).toBeUndefined();
            expect(bindings.cmdhistory.getLastUndo()).toBe(undoable);
        });

        test("undo/redo bindings: redo crash caught in binding by provided function", () => {
            bindings.undoRedoBinder(bundo, bredo, fn);

            robot(bredo).click();

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("err"));
            expect(bindings.cmdhistory.getLastRedo()).toBeUndefined();
            expect(bindings.cmdhistory.getLastUndo()).toBe(undoable);
        });

        test("undo/redo bindings: redo works correctly", () => {
            undoable.redo.mockImplementation(() => {});

            bindings.undoRedoBinder(bundo, bredo);
            robot(bredo).click();

            expect(bindings.cmdhistory.getLastRedo()).toBeUndefined();
            expect(bindings.cmdhistory.getLastUndo()).toBe(undoable);
        });
    });
});
