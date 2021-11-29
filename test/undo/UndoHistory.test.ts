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

import type {Undoable} from "../../src/api/undo/Undoable";
import {UndoHistoryImpl} from "../../src/impl/undo/UndoHistoryImpl";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import type {UndoHistory} from "../../src/api/undo/UndoHistory";

jest.mock("../../src/api/undo/Undoable");

let undoable: MockProxy<Undoable> & Undoable;
let undoable2: MockProxy<Undoable> & Undoable;
let instance: UndoHistory;

beforeEach(() => {
    instance = new UndoHistoryImpl();
    instance.setSizeMax(10);
    undoable = mock<Undoable>();
    undoable2 = mock<Undoable>();
    undoable.getUndoName.mockReturnValue("undoredomsg");
});

test("testUndoCallundo", () => {
    instance.add(undoable);
    instance.undo();
    expect(undoable.undo).toHaveBeenCalledTimes(1);
});

test("testRedowithUndoDonewithGlobalUndoable", () => {
    instance.add(undoable);
    instance.undo();
    instance.redo();
    expect(undoable.undo).toHaveBeenCalledTimes(1);
    expect(undoable.redo).toHaveBeenCalledTimes(1);
});

test("testRedowhenRedoEmpty", () => {
    instance.redo();
    expect(undoable.redo).not.toHaveBeenCalled();
});

test("testUndowhenUndoEmpty", () => {
    instance.undo();
    expect(undoable.undo).not.toHaveBeenCalled();
});

test("testRedoCallredo", () => {
    instance.add(undoable);
    instance.undo();
    instance.redo();
    expect(undoable.redo).toHaveBeenCalledTimes(1);
    expect(instance.getLastUndo()).toBe(undoable);
});


test("history limit works as expected on new undoable instances", () => {
    const undoable3 = mock<Undoable>();
    instance.setSizeMax(2);
    instance.add(undoable);
    instance.add(undoable2);
    instance.add(undoable3);
    expect(instance.getUndo()).toHaveLength(2);
    expect(instance.getUndo()[0]).toBe(undoable2);
    expect(instance.getUndo()[1]).toBe(undoable3);
});


test("testSetSizeMaxKO", () => {
    instance.setSizeMax(-1);
    instance.add(undoable);
    expect(instance.getLastUndo()).toBe(undoable);
});

test("testSetSizeMax0KO", () => {
    instance.setSizeMax(0);
    instance.add(undoable);
    expect(instance.getLastUndo()).toBeUndefined();
});

test("testAddUndoablewith0SizeUndoable", () => {
    instance.setSizeMax(0);
    instance.add(undoable);
    expect(instance.getUndo()).toHaveLength(0);
    expect(instance.getRedo()).toHaveLength(0);
});


test("testSizeMaxMutatorsUndoableRemoved", () => {
    instance.setSizeMax(5);
    instance.add(undoable);
    expect(instance.getUndo()).toHaveLength(1);
    expect(instance.getRedo()).toHaveLength(0);
    expect(instance.getLastUndo()).toBe(undoable);
});

test("testSizeMaxRemovedWhen0", () => {
    const undos = new Array<Undoable | undefined>();
    instance.setSizeMax(5);
    instance.add(undoable);
    const undosStream = instance.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));
    instance.setSizeMax(0);
    undosStream.unsubscribe();
    expect(instance.getLastUndo()).toBeUndefined();
    expect(undos).toHaveLength(1);
    expect(undos[0]).toBeUndefined();
});

test("changing the history size clears two oldest undoable instances", () => {
    const undoable3 = mock<Undoable>();
    instance.add(undoable);
    instance.add(undoable2);
    instance.add(undoable3);
    instance.setSizeMax(1);

    expect(instance.getUndo()).toHaveLength(1);
    expect(instance.getLastUndo()).toBe(undoable3);
});

test("changing the history size clears one oldest undoable instances", () => {
    const undoable3 = mock<Undoable>();
    instance.add(undoable);
    instance.add(undoable2);
    instance.add(undoable3);
    instance.setSizeMax(2);

    expect(instance.getUndo()).toHaveLength(2);
    expect(instance.getUndo()[0]).toBe(undoable2);
    expect(instance.getUndo()[1]).toBe(undoable3);
});

test("changing the history size clears all oldest undoable instances", () => {
    const undoable3 = mock<Undoable>();
    instance.add(undoable);
    instance.add(undoable2);
    instance.add(undoable3);
    instance.setSizeMax(0);

    expect(instance.getUndo()).toHaveLength(0);
    expect(instance.getLastUndo()).toBeUndefined();
});

test("changing the history size does not remove undoable instances", () => {
    const undoable3 = mock<Undoable>();
    instance.add(undoable);
    instance.add(undoable2);
    instance.add(undoable3);
    instance.setSizeMax(3);

    expect(instance.getUndo()).toHaveLength(3);
});

test("testSizeMaxMutatorsSizeOK", () => {
    instance.setSizeMax(21);
    expect(instance.getSizeMax()).toBe(21);
});

test("testSizeMaxMutatorsSizeKO", () => {
    instance.setSizeMax(5);
    instance.setSizeMax(-1);
    expect(instance.getSizeMax()).toBe(5);
});

test("testGetLastRedoNothingStart", () => {
    expect(instance.getLastRedo()).toBeUndefined();
});

test("testGetLastRedoNothingOnNewUndoable", () => {
    instance.add(undoable);
    expect(instance.getLastRedo()).toBeUndefined();
});

test("testGetLastRedoOKOnRedo", () => {
    instance.add(undoable);
    instance.undo();
    expect(instance.getLastRedo()).toStrictEqual(undoable);
});

test("testGetLastUndoNothingAtStart", () => {
    expect(instance.getLastUndo()).toBeUndefined();
});

test("testGetLastUndoOKOnAdd", () => {
    instance.add(undoable);
    expect(instance.getLastUndo()).toStrictEqual(undoable);
});

test("testGetLastUndoMessageNothingOnStart", () => {
    expect(instance.getLastUndoMessage()).toBeUndefined();
});

test("getLastOrEmptyUndoMessage NothingOnStart", () => {
    expect(instance.getLastOrEmptyUndoMessage()).toBe("");
});

test("testGetLastRedoMessageNothingOnStart", () => {
    expect(instance.getLastRedoMessage()).toBeUndefined();
});

test("getLastOrEmptyRedoMessage NothingOnStart", () => {
    expect(instance.getLastOrEmptyRedoMessage()).toBe("");
});

test("testGetLastUndoMessageOK", () => {
    instance.add(undoable);
    expect(instance.getLastUndoMessage()).toBe("undoredomsg");
});

test("getLastOrEmptyUndoMessage OK", () => {
    instance.add(undoable);
    expect(instance.getLastOrEmptyUndoMessage()).toBe("undoredomsg");
});

test("testGetLastRedoMessageOK", () => {
    instance.add(undoable);
    instance.undo();
    expect(instance.getLastRedoMessage()).toBe("undoredomsg");
});

test("getLastOrEmptyRedoMessage OK", () => {
    instance.add(undoable);
    instance.undo();
    expect(instance.getLastOrEmptyRedoMessage()).toBe("undoredomsg");
});

test("testClear", () => {
    instance.add(undoable);
    instance.add(undoable2);
    instance.undo();
    instance.clear();
    expect(instance.getLastRedo()).toBeUndefined();
    expect(instance.getLastUndo()).toBeUndefined();
});

test("testUndosAdded", () => {
    const undos = new Array<Undoable | undefined>();
    const undosStream = instance.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));

    instance.add(undoable);
    undosStream.unsubscribe();

    expect(undos).toHaveLength(1);
    expect(undos[0]).toStrictEqual(undoable);
});

test("testUndoRedoAdded", () => {
    const undos = new Array<Undoable | undefined>();
    const redos = new Array<Undoable | undefined>();
    const undosStream = instance.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));
    const redosStream = instance.redosObservable().subscribe((e: Undoable | undefined) => redos.push(e));

    instance.add(undoable);
    instance.undo();
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
    instance.add(undoable);
    instance.add(undoable2);

    expect(() => instance.undo()).toThrow(new Error("err"));
    expect(instance.getUndo()).toHaveLength(1);
    expect(instance.getRedo()).toHaveLength(1);
});

test("crash in redo OK", () => {
    undoable2.redo.mockImplementation(() => {
        throw new Error("err2");
    });
    instance.add(undoable);
    instance.add(undoable2);

    instance.undo();
    expect(() => instance.redo()).toThrow(new Error("err2"));
    expect(instance.getUndo()).toHaveLength(2);
    expect(instance.getRedo()).toHaveLength(0);
});
