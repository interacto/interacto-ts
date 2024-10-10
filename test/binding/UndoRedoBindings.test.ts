/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import {BindingsContext, BindingsImpl, Redo, Undo, UndoHistoryImpl} from "../../src/interacto";
import {robot} from "../interaction/StubEvents";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {Bindings, Undoable, UndoHistoryBase} from "../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

let bundo: HTMLButtonElement;
let bredo: HTMLButtonElement;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;
let undoable: MockProxy<Undoable> & Undoable;
let fn: jest.Mock;

describe("test undo redo bindings", () => {
    beforeEach(() => {
        fn = jest.fn();
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        bundo = document.createElement("button");
        bredo = document.createElement("button");
        undoable = mock<Undoable>();
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllMocks();
    });

    describe("test undo bindings", () => {
        beforeEach(() => {
            undoable.undo.mockImplementation(() => {
                throw new Error("errr");
            });
            bindings.undoHistory.add(undoable);
        });

        test("undo/redo: undo crash caught in binding", () => {
            bindings
                .buttonBinder()
                .toProduce(() => new Undo(bindings.undoHistory))
                .on(bundo)
                .catch(fn)
                .bind();

            robot(bundo).click();
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("errr"));
            expect(bindings.undoHistory.getLastUndo()).toBeUndefined();
            expect(bindings.undoHistory.getLastRedo()).toBe(undoable);
        });

        test("undo/redo bindings: undo crash caught in binding by provided function", () => {
            bindings.undoRedoBinder(bundo, bredo, fn);

            robot(bundo).click();

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("errr"));
            expect(bindings.undoHistory.getLastUndo()).toBeUndefined();
            expect(bindings.undoHistory.getLastRedo()).toBe(undoable);
        });

        test("undo/redo bindings: undo works correctly", () => {
            undoable.undo.mockImplementation(() => {});

            bindings.undoRedoBinder(bundo, bredo);
            robot(bundo).click();

            expect(bindings.undoHistory.getLastUndo()).toBeUndefined();
            expect(bindings.undoHistory.getLastRedo()).toBe(undoable);
        });
    });

    describe("test redo bindings", () => {
        beforeEach(() => {
            undoable.redo.mockImplementation(() => {
                throw new Error("err");
            });
            bindings.undoHistory.add(undoable);
            bindings.undoHistory.undo();
        });

        test("undo/redo: redo crash caught in binding", () => {
            bindings
                .buttonBinder()
                .toProduce(() => new Redo(bindings.undoHistory))
                .on(bredo)
                .catch(fn)
                .bind();

            robot(bredo).click();
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("err"));
            expect(bindings.undoHistory.getLastRedo()).toBeUndefined();
            expect(bindings.undoHistory.getLastUndo()).toBe(undoable);
        });

        test("undo/redo bindings: redo crash caught in binding by provided function", () => {
            bindings.undoRedoBinder(bundo, bredo, fn);

            robot(bredo).click();

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(new Error("err"));
            expect(bindings.undoHistory.getLastRedo()).toBeUndefined();
            expect(bindings.undoHistory.getLastUndo()).toBe(undoable);
        });

        test("undo/redo bindings: redo works correctly", () => {
            undoable.redo.mockImplementation(() => {});

            bindings.undoRedoBinder(bundo, bredo);
            robot(bredo).click();

            expect(bindings.undoHistory.getLastRedo()).toBeUndefined();
            expect(bindings.undoHistory.getLastUndo()).toBe(undoable);
        });
    });
});
