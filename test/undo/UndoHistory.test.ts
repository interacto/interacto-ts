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

import {UndoHistoryImpl} from "../../src/impl/undo/UndoHistoryImpl";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {Undoable} from "../../src/api/undo/Undoable";
import type {UndoHistory} from "../../src/api/undo/UndoHistory";
import type {MockProxy} from "jest-mock-extended";

describe("using an undo history", () => {
    jest.mock("../../src/api/undo/Undoable");

    let undoable: MockProxy<Undoable> & Undoable;
    let undoable2: MockProxy<Undoable> & Undoable;
    let history: UndoHistory;

    beforeEach(() => {
        history = new UndoHistoryImpl();
        history.setSizeMax(10);
        undoable = mock<Undoable>();
        undoable2 = mock<Undoable>();
        undoable.getUndoName.mockReturnValue("undoredomsg");
    });

    test("undo called", () => {
        history.add(undoable);
        history.undo();
        expect(undoable.undo).toHaveBeenCalledTimes(1);
    });

    test("undo and redo called", () => {
        history.add(undoable);
        history.undo();
        history.redo();
        expect(undoable.undo).toHaveBeenCalledTimes(1);
        expect(undoable.redo).toHaveBeenCalledTimes(1);
    });

    test("redo not called", () => {
        history.add(undoable);
        history.redo();
        expect(undoable.redo).not.toHaveBeenCalled();
    });

    test("undo ok when empty", () => {
        history.undo();
        expect(history.getLastUndo()).toBeUndefined();
    });

    test("get last undo ok on add", () => {
        history.add(undoable);
        history.undo();
        history.redo();
        expect(undoable.redo).toHaveBeenCalledTimes(1);
        expect(history.getLastUndo()).toBe(undoable);
    });

    test("history limit works as expected on new undoable instances", () => {
        const undoable3 = mock<Undoable>();
        history.setSizeMax(2);
        history.add(undoable);
        history.add(undoable2);
        history.add(undoable3);
        expect(history.getUndo()).toHaveLength(2);
        expect(history.getUndo()[0]).toBe(undoable2);
        expect(history.getUndo()[1]).toBe(undoable3);
    });

    test("setSizeMaxKO", () => {
        history.setSizeMax(-1);
        history.add(undoable);
        expect(history.getLastUndo()).toBe(undoable);
    });

    test("setSizeMax0KO", () => {
        history.setSizeMax(0);
        history.add(undoable);
        expect(history.getLastUndo()).toBeUndefined();
    });

    test("addUndoablewith0SizeUndoable", () => {
        history.setSizeMax(0);
        history.add(undoable);
        expect(history.getUndo()).toHaveLength(0);
        expect(history.getRedo()).toHaveLength(0);
    });

    test("sizeMaxMutatorsUndoableRemoved", () => {
        history.setSizeMax(5);
        history.add(undoable);
        expect(history.getUndo()).toHaveLength(1);
        expect(history.getRedo()).toHaveLength(0);
        expect(history.getLastUndo()).toBe(undoable);
    });

    test("sizeMaxRemovedWhen0", () => {
        const undos = new Array<Undoable | undefined>();
        history.setSizeMax(5);
        history.add(undoable);
        const undosStream = history.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));
        history.setSizeMax(0);
        undosStream.unsubscribe();
        expect(history.getLastUndo()).toBeUndefined();
        expect(undos).toHaveLength(1);
        expect(undos[0]).toBeUndefined();
    });

    test("changing the history size clears two oldest undoable instances", () => {
        const undoable3 = mock<Undoable>();
        history.add(undoable);
        history.add(undoable2);
        history.add(undoable3);
        history.setSizeMax(1);

        expect(history.getUndo()).toHaveLength(1);
        expect(history.getLastUndo()).toBe(undoable3);
    });

    test("changing the history size clears one oldest undoable instances", () => {
        const undoable3 = mock<Undoable>();
        history.add(undoable);
        history.add(undoable2);
        history.add(undoable3);
        history.setSizeMax(2);

        expect(history.getUndo()).toHaveLength(2);
        expect(history.getUndo()[0]).toBe(undoable2);
        expect(history.getUndo()[1]).toBe(undoable3);
    });

    test("changing the history size clears all oldest undoable instances", () => {
        const undoable3 = mock<Undoable>();
        history.add(undoable);
        history.add(undoable2);
        history.add(undoable3);
        history.setSizeMax(0);

        expect(history.getUndo()).toHaveLength(0);
        expect(history.getLastUndo()).toBeUndefined();
    });

    test("changing the history size does not remove undoable instances", () => {
        const undoable3 = mock<Undoable>();
        history.add(undoable);
        history.add(undoable2);
        history.add(undoable3);
        history.setSizeMax(3);

        expect(history.getUndo()).toHaveLength(3);
    });

    test("sizeMaxMutatorsSizeOK", () => {
        history.setSizeMax(21);
        expect(history.getSizeMax()).toBe(21);
    });

    test("sizeMaxMutatorsSizeKO", () => {
        history.setSizeMax(5);
        history.setSizeMax(-1);
        expect(history.getSizeMax()).toBe(5);
    });

    test("getLastRedoNothingStart", () => {
        expect(history.getLastRedo()).toBeUndefined();
    });

    test("getLastRedoNothingOnNewUndoable", () => {
        history.add(undoable);
        expect(history.getLastRedo()).toBeUndefined();
    });

    test("getLastRedoOKOnRedo", () => {
        history.add(undoable);
        history.undo();
        expect(history.getLastRedo()).toStrictEqual(undoable);
    });

    test("getLastUndoNothingAtStart", () => {
        expect(history.getLastUndo()).toBeUndefined();
    });

    test("getLastUndoOKOnAdd", () => {
        history.add(undoable);
        expect(history.getLastUndo()).toStrictEqual(undoable);
    });

    test("getLastUndoMessageNothingOnStart", () => {
        expect(history.getLastUndoMessage()).toBeUndefined();
    });

    test("lastOrEmptyUndoMessage NothingOnStart", () => {
        expect(history.getLastOrEmptyUndoMessage()).toBe("");
    });

    test("getLastRedoMessageNothingOnStart", () => {
        expect(history.getLastRedoMessage()).toBeUndefined();
    });

    test("lastOrEmptyRedoMessage NothingOnStart", () => {
        expect(history.getLastOrEmptyRedoMessage()).toBe("");
    });

    test("getLastUndoMessageOK", () => {
        history.add(undoable);
        expect(history.getLastUndoMessage()).toBe("undoredomsg");
    });

    test("lastOrEmptyUndoMessage OK", () => {
        history.add(undoable);
        expect(history.getLastOrEmptyUndoMessage()).toBe("undoredomsg");
    });

    test("getLastRedoMessageOK", () => {
        history.add(undoable);
        history.undo();
        expect(history.getLastRedoMessage()).toBe("undoredomsg");
    });

    test("lastOrEmptyRedoMessage OK", () => {
        history.add(undoable);
        history.undo();
        expect(history.getLastOrEmptyRedoMessage()).toBe("undoredomsg");
    });

    test("clear", () => {
        history.add(undoable);
        history.add(undoable2);
        history.undo();
        history.clear();
        expect(history.getLastRedo()).toBeUndefined();
        expect(history.getLastUndo()).toBeUndefined();
    });

    test("undos Added", () => {
        const undos = new Array<Undoable | undefined>();
        const undosStream = history.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));

        history.add(undoable);
        undosStream.unsubscribe();

        expect(undos).toHaveLength(1);
        expect(undos[0]).toStrictEqual(undoable);
    });

    test("undo Redo Added", () => {
        const undos = new Array<Undoable | undefined>();
        const redos = new Array<Undoable | undefined>();
        const undosStream = history.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));
        const redosStream = history.redosObservable().subscribe((e: Undoable | undefined) => redos.push(e));

        history.add(undoable);
        history.undo();
        undosStream.unsubscribe();
        redosStream.unsubscribe();

        expect(undos).toHaveLength(2);
        expect(undos[1]).toBeUndefined();
        expect(redos).toHaveLength(1);
        expect(redos[0]).toBe(undoable);
    });

    test("crash in undo OK", () => {
        undoable2.undo.mockImplementation(() => {
            throw new Error("err");
        });
        history.add(undoable);
        history.add(undoable2);

        expect(() => history.undo()).toThrow(new Error("err"));
        expect(history.getUndo()).toHaveLength(1);
        expect(history.getRedo()).toHaveLength(1);
    });

    test("crash in redo OK", () => {
        undoable2.redo.mockImplementation(() => {
            throw new Error("err2");
        });
        history.add(undoable);
        history.add(undoable2);

        history.undo();
        expect(() => history.redo()).toThrow(new Error("err2"));
        expect(history.getUndo()).toHaveLength(2);
        expect(history.getRedo()).toHaveLength(0);
    });

    describe("using a history that considers equal commands", () => {
        let undoableA: Undoable;
        let undoableB: Undoable;
        let undoableC: Undoable;
        let undoableD: Undoable;
        let undoableE: Undoable;

        beforeEach(() => {
            history = new UndoHistoryImpl(true);
            undoableA = mock<Undoable>();
            undoableB = mock<Undoable>();
            undoableC = mock<Undoable>();
            undoableD = mock<Undoable>();
            undoableE = mock<Undoable>();

            history.add(undoableA);
            history.add(undoableB);
            history.add(undoableC);
            history.add(undoableD);
        });

        test("does a redo if equal command", () => {
            // A *B C D
            history.undo();
            history.undo();
            undoableC.equals = jest.fn(() => true);
            history.add(undoableE);

            expect(history.getLastUndo()).toBe(undoableC);
            expect(history.getLastRedo()).toBe(undoableD);
        });

        test("clears redos if not equal command", () => {
            // A *B C D
            history.undo();
            history.undo();
            undoableC.equals = jest.fn(() => false);
            history.add(undoableE);

            expect(history.getLastUndo()).toBe(undoableE);
            expect(history.getLastRedo()).toBeUndefined();
        });
    });
});
