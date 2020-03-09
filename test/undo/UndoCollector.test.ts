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
import { Undoable, UndoCollector, Optional } from "../../src";

jest.mock("../../src/undo/Undoable");

let undoable: Undoable;
let instance: UndoCollector;

beforeEach(() => {
    jest.clearAllMocks();
    instance = new UndoCollector();
    instance.setSizeMax(10);
    undoable = {
        undo: jest.fn(() => {}),
        redo: jest.fn(() => {}),
        getUndoName: jest.fn(() => "undoredomsg")
    };
});

test("testGetSetInstanceOK", () => {
    UndoCollector.setInstance(instance);
    expect(UndoCollector.getInstance()).toBe(instance);
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
    expect(instance.getLastUndo().get()).toBe(undoable);
});


test("testSetSizeMaxKO", () => {
    instance.setSizeMax(-1);
    instance.add(undoable);
    expect(instance.getLastUndo().get()).toBe(undoable);
});

test("testSetSizeMax0KO", () => {
    instance.setSizeMax(0);
    instance.add(undoable);
    expect(instance.getLastUndo().isPresent()).toBeFalsy();
});

test("testAddUndoablewith0SizeUndoable", () => {
    instance.setSizeMax(0);
    instance.add(undoable);
    expect(instance.getUndo()).toHaveLength(0);
    expect(instance.getRedo()).toHaveLength(0);
});

test("testAddUndoablewithLimitedUndoSize", () => {
    const undoable2 = {
        undo: jest.fn(() => {}),
        redo: jest.fn(() => {}),
        getUndoName: jest.fn(() => "")
    };
    instance.setSizeMax(1);
    instance.add(undoable);
    instance.add(undoable2);
    expect(instance.getUndo()).toHaveLength(1);
    expect(instance.getUndo()[0]).toBe(undoable2);
});

test("testSizeMaxMutatorsUndoableRemoved", () => {
    instance.setSizeMax(5);
    instance.add(undoable);
    expect(instance.getLastUndo().isPresent()).toBeTruthy();
});

test("testSizeMaxRemovedWhen0", () => {
    const undos = new Array<Optional<Undoable>>();
    instance.setSizeMax(5);
    instance.add(undoable);
    const undosStream = instance.undosObservable().subscribe((e: Optional<Undoable>) => undos.push(e));
    instance.setSizeMax(0);
    undosStream.unsubscribe();
    expect(instance.getLastUndo().isPresent()).toBeFalsy();
    expect(undos).toHaveLength(1);
    expect(undos[0].isPresent()).toBeFalsy();
});

test("testSizeMaxRemovedWhen1", () => {
    const undoable2 = {
        undo: jest.fn(() => {}),
        redo: jest.fn(() => {}),
        getUndoName: jest.fn(() => "")
    };
    const undos = new Array<Optional<Undoable>>();
    instance.setSizeMax(5);
    instance.add(undoable);
    instance.add(undoable2);
    const undosStream = instance.undosObservable().subscribe((e: Optional<Undoable>) => undos.push(e));
    instance.setSizeMax(1);
    undosStream.unsubscribe();
    expect(instance.getLastUndo().isPresent()).toBeTruthy();
    expect(instance.getLastUndo().get()).toStrictEqual(undoable);
    expect(undos).toHaveLength(0);
});

test("testSizeMaxMutatorsSizeOK", () => {
    instance.setSizeMax(21);
    expect(instance.getSizeMax()).toStrictEqual(21);
});

test("testSizeMaxMutatorsSizeKO", () => {
    instance.setSizeMax(5);
    instance.setSizeMax(-1);
    expect(instance.getSizeMax()).toStrictEqual(5);
});

test("testGetLastRedoNothingStart", () => {
    expect(instance.getLastRedo().isPresent()).toBeFalsy();
});

test("testGetLastRedoNothingOnNewUndoable", () => {
    instance.add(undoable);
    expect(instance.getLastRedo().isPresent()).toBeFalsy();
});

test("testGetLastRedoOKOnRedo", () => {
    instance.add(undoable);
    instance.undo();
    expect(instance.getLastRedo().get()).toStrictEqual(undoable);
});

test("testGetLastUndoNothingAtStart", () => {
    expect(instance.getLastUndo().isPresent()).toBeFalsy();
});

test("testGetLastUndoOKOnAdd", () => {
    instance.add(undoable);
    expect(instance.getLastUndo().get()).toStrictEqual(undoable);
});

test("testGetLastUndoMessageNothingOnStart", () => {
    expect(instance.getLastUndoMessage().isPresent()).toBeFalsy();
});

test("testGetLastRedoMessageNothingOnStart", () => {
    expect(instance.getLastRedoMessage().isPresent()).toBeFalsy();
});

test("testGetLastUndoMessageOK", () => {
    instance.add(undoable);
    expect(instance.getLastUndoMessage().get()).toStrictEqual("undoredomsg");
});

test("testGetLastRedoMessageOK", () => {
    instance.add(undoable);
    instance.undo();
    expect(instance.getLastRedoMessage().get()).toStrictEqual("undoredomsg");
});

test("testClear", () => {
    const undoable2 = {
        undo: jest.fn(() => {}),
        redo: jest.fn(() => {}),
        getUndoName: jest.fn(() => "")
    };
    instance.add(undoable);
    instance.add(undoable2);
    instance.undo();
    instance.clear();
    expect(instance.getLastRedo().isPresent()).toBeFalsy();
    expect(instance.getLastUndo().isPresent()).toBeFalsy();
});

test("testUndosAdded", () => {
    const undos = new Array<Optional<Undoable>>();
    const undosStream = instance.undosObservable().subscribe((e: Optional<Undoable>) => undos.push(e));

    instance.add(undoable);
    undosStream.unsubscribe();

    expect(undos).toHaveLength(1);
    expect(undos[0].get()).toStrictEqual(undoable);
});

test("testUndoRedoAdded", () => {
    const undos = new Array<Optional<Undoable>>();
    const redos = new Array<Optional<Undoable>>();
    const undosStream = instance.undosObservable().subscribe((e: Optional<Undoable>) => undos.push(e));
    const redosStream = instance.redosObservable().subscribe((e: Optional<Undoable>) => redos.push(e));

    instance.add(undoable);
    instance.undo();
    undosStream.unsubscribe();
    redosStream.unsubscribe();

    expect(undos).toHaveLength(2);
    expect(undos[1].isPresent()).toBeFalsy();
    expect(redos).toHaveLength(1);
    expect(redos[0].get()).toBe(undoable);
});
