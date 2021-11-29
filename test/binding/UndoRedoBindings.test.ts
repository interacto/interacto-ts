import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import type {Undoable} from "../../src/api/undo/Undoable";
import {robot} from "../interaction/StubEvents";
import {BindingsImpl} from "../../src/impl/binding/BindingsImpl";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";
import {Undo} from "../../src/impl/command/library/Undo";
import {Redo} from "../../src/impl/command/library/Redo";

let bundo: HTMLButtonElement;
let bredo: HTMLButtonElement;
let ctx: BindingsContext;
let bindings: Bindings;
let undoable: MockProxy<Undoable> & Undoable;
let fn: jest.Mock;

describe("test undo redo bindings", () => {
    beforeEach(() => {
        fn = jest.fn();
        bindings = new BindingsImpl(undefined);
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
            undoable.undo.mockImplementation(() => {
            });

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
            undoable.redo.mockImplementation(() => {
            });

            bindings.undoRedoBinder(bundo, bredo);
            robot(bredo).click();

            expect(bindings.undoHistory.getLastRedo()).toBeUndefined();
            expect(bindings.undoHistory.getLastUndo()).toBe(undoable);
        });
    });
});
