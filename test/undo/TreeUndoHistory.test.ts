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
import {mock} from "jest-mock-extended";
import type {TreeUndoHistory} from "../../src/api/undo/TreeUndoHistory";
import {TreeUndoHistoryImpl} from "../../src/impl/undo/TreeUndoHistoryImpl";

describe("using a graph undo history", () => {
    let history: TreeUndoHistory;
    let undoable0: Undoable;
    let undoable1: Undoable;

    beforeEach(() => {
        history = new TreeUndoHistoryImpl();
        undoable0 = mock<Undoable>();
        undoable1 = mock<Undoable>();
    });

    afterEach(() => {
        history.clear();
        jest.clearAllMocks();
    });

    test("initial history is empty", () => {
        expect(history.undoableNodes).toHaveLength(0);
        expect(history.currentNode).toBeUndefined();
    });

    test("undo does nothing", () => {
        history.undo();
        expect(history.undoableNodes).toHaveLength(0);
        expect(history.currentNode).toBeUndefined();
    });

    test("go to empty ok", () => {
        history.goTo(0);
        expect(history.undoableNodes).toHaveLength(0);
        expect(history.currentNode).toBeUndefined();
    });

    test("delete invalid node ok", () => {
        history.delete(0);
        expect(history.undoableNodes).toHaveLength(0);
        expect(history.currentNode).toBeUndefined();
    });

    test("get last undoable when empty", () => {
        expect(history.getLastUndo()).toBeUndefined();
    });

    test("get last undoable message when empty", () => {
        expect(history.getLastUndoMessage()).toBeUndefined();
    });

    test("get last undoable message or empty when empty", () => {
        expect(history.getLastOrEmptyUndoMessage()).toBe("");
    });

    test("get last redoable when empty", () => {
        expect(history.getLastRedo()).toBeUndefined();
    });

    test("get last redoable message when empty", () => {
        expect(history.getLastRedoMessage()).toBeUndefined();
    });

    test("get last reodable message or empty when empty", () => {
        expect(history.getLastOrEmptyRedoMessage()).toBe("");
    });

    describe("and using a single undoable", () => {
        beforeEach(() => {
            history.add(undoable0);
        });

        test("get last undoable when one element", () => {
            expect(history.getLastUndo()).toBe(undoable0);
        });

        test("add root works", () => {
            expect(history.undoableNodes).toHaveLength(1);
            expect(history.undoableNodes[0]).toBeDefined();
            expect(history.undoableNodes[0]?.undoable).toBe(undoable0);
            expect(history.currentNode).toBeDefined();
            expect(history.currentNode?.undoable).toBe(undoable0);
        });

        test("undo works", () => {
            history.undo();
            expect(history.undoableNodes).toHaveLength(1);
            expect(history.undoableNodes[0]).toBeDefined();
            expect(history.currentNode).toBeUndefined();
            expect(undoable0.undo).toHaveBeenCalledTimes(1);
        });

        test("redo does nothing", () => {
            history.redo();
            expect(history.undoableNodes).toHaveLength(1);
            expect(history.undoableNodes[0]).toBeDefined();
            expect(history.currentNode).toBeDefined();
            expect(undoable0.redo).not.toHaveBeenCalledTimes(1);
        });

        test("get last redoable when one element and has a redo", () => {
            history.undo();
            expect(history.getLastRedo()).toBe(undoable0);
        });

        test("get last redoable message when one element and ahs a redo", () => {
            undoable0.getUndoName = (): string => "fooo";
            history.undo();
            expect(history.getLastRedoMessage()).toBe("fooo");
        });

        test("get last redoable message or empty when one element and ahs a redo", () => {
            undoable0.getUndoName = (): string => "barr";
            history.undo();
            expect(history.getLastOrEmptyRedoMessage()).toBe("barr");
        });

        test("undo redo works", () => {
            history.undo();
            history.redo();
            expect(history.undoableNodes).toHaveLength(1);
            expect(history.undoableNodes[0]).toBeDefined();
            expect(history.undoableNodes[0]?.undoable).toBe(undoable0);
            expect(history.currentNode).toBeDefined();
            expect(undoable0.undo).toHaveBeenCalledTimes(1);
            expect(undoable0.redo).toHaveBeenCalledTimes(1);
        });

        test("undo new command, creates a branch", () => {
            history.undo();
            history.add(undoable1);
            expect(history.undoableNodes).toHaveLength(2);
            expect(history.undoableNodes[0]?.undoable).toBe(undoable0);
            expect(history.undoableNodes[1]?.undoable).toBe(undoable1);
            expect(history.undoableNodes[0]?.parent).toBeUndefined();
            expect(history.undoableNodes[1]?.parent).toBeUndefined();
            expect(history.undoableNodes[0]?.children).toHaveLength(0);
            expect(history.undoableNodes[1]?.children).toHaveLength(0);
            expect(history.currentNode?.undoable).toBe(undoable1);
        });

        test("clear ok", () => {
            history.clear();
            expect(history.currentNode).toBeUndefined();
            expect(history.undoableNodes).toHaveLength(0);
        });

        test("clear then add restarts ID at 0", () => {
            history.clear();
            history.add(undoable1);
            expect(history.undoableNodes[0]?.id).toBe(0);
        });

        test("go to itself", () => {
            history.goTo(0);

            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(history.undoableNodes).toHaveLength(1);
            expect(undoable0.undo).not.toHaveBeenCalled();
            expect(undoable0.redo).not.toHaveBeenCalled();
        });

        test("go to undoable1 from root", () => {
            history.undo();
            history.goTo(0);

            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(undoable0.undo).toHaveBeenCalledTimes(1);
            expect(undoable0.redo).toHaveBeenCalledTimes(1);
        });

        test("go to undefined ok", () => {
            history.goTo(1000);

            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(undoable0.undo).not.toHaveBeenCalled();
            expect(undoable0.redo).not.toHaveBeenCalled();
        });

        test("go to negative id ok", () => {
            history.goTo(-2);

            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(undoable0.undo).not.toHaveBeenCalled();
            expect(undoable0.redo).not.toHaveBeenCalled();
        });

        test("go to undoable1 from undoable2", () => {
            history.undo();
            history.add(undoable1);
            history.goTo(0);

            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(undoable1.undo).toHaveBeenCalledTimes(1);
            expect(undoable0.undo).toHaveBeenCalledTimes(1);
            expect(undoable0.redo).toHaveBeenCalledTimes(1);
        });

        test("delete negative node ID ok", () => {
            history.delete(-1);
            expect(history.undoableNodes).toHaveLength(1);
            expect(history.currentNode?.undoable).toBe(undoable0);
        });

        test("delete invalid ok", () => {
            history.delete(1);
            expect(history.undoableNodes).toHaveLength(1);
            expect(history.currentNode?.undoable).toBe(undoable0);
        });

        test("delete ok", () => {
            history.delete(0);
            expect(history.undoableNodes[0]).toBeUndefined();
            expect(history.currentNode).toBeUndefined();
        });
    });


    describe("and using five undoable in different paths", () => {
        let undoable2: Undoable;
        let undoable3: Undoable;
        let undoable4: Undoable;

        beforeEach(() => {
            undoable2 = mock<Undoable>();
            undoable3 = mock<Undoable>();
            undoable4 = mock<Undoable>();
            //   *
            //   0
            // 1   2
            //    3 4
            history.add(undoable0);
            history.add(undoable1);
            history.undo();
            history.add(undoable2);
            history.add(undoable3);
            history.undo();
            history.add(undoable4);
        });

        test("get last undoable when multiple elements", () => {
            expect(history.getLastUndo()).toBe(undoable4);
        });

        test("tree structure is valid", () => {
            expect(history.currentNode?.undoable).toBe(undoable4);
            expect(history.undoableNodes[0]?.parent).toBeUndefined();
            expect(history.undoableNodes[0]?.children).toHaveLength(2);
            expect(history.undoableNodes[0]?.children[0]?.undoable).toBe(undoable1);
            expect(history.undoableNodes[0]?.children[1]?.undoable).toBe(undoable2);
            expect(history.undoableNodes[1]?.children).toHaveLength(0);
            expect(history.undoableNodes[1]?.parent?.undoable).toBe(undoable0);
            expect(history.undoableNodes[2]?.children).toHaveLength(2);
            expect(history.undoableNodes[2]?.children[0]?.undoable).toBe(undoable3);
            expect(history.undoableNodes[2]?.children[1]?.undoable).toBe(undoable4);
            expect(history.undoableNodes[2]?.parent?.undoable).toBe(undoable0);
            expect(history.undoableNodes[3]?.children).toHaveLength(0);
            expect(history.undoableNodes[3]?.parent?.undoable).toBe(undoable2);
            expect(history.undoableNodes[4]?.children).toHaveLength(0);
            expect(history.undoableNodes[4]?.parent?.undoable).toBe(undoable2);
        });

        test("go to 1", () => {
            history.goTo(1);
            expect(history.currentNode?.undoable).toBe(undoable1);
            expect(undoable0.undo).not.toHaveBeenCalled();
            expect(undoable0.redo).not.toHaveBeenCalled();
            expect(undoable1.redo).toHaveBeenCalledTimes(1);
            expect(undoable1.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.undo).toHaveBeenCalledTimes(1);
            expect(undoable4.undo).toHaveBeenCalledTimes(1);
            expect(undoable2.undo).toHaveBeenCalledTimes(1);
        });

        test("go to 1 and then 0", () => {
            history.goTo(1);
            history.goTo(0);
            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(undoable0.undo).not.toHaveBeenCalled();
            expect(undoable0.redo).not.toHaveBeenCalled();
            expect(undoable1.redo).toHaveBeenCalledTimes(1);
            expect(undoable1.undo).toHaveBeenCalledTimes(2);
            expect(undoable3.undo).toHaveBeenCalledTimes(1);
            expect(undoable4.undo).toHaveBeenCalledTimes(1);
            expect(undoable2.undo).toHaveBeenCalledTimes(1);
        });

        test("go to 3", () => {
            history.goTo(3);
            expect(history.currentNode?.undoable).toBe(undoable3);
            expect(undoable0.undo).not.toHaveBeenCalled();
            expect(undoable0.redo).not.toHaveBeenCalled();
            expect(undoable1.redo).not.toHaveBeenCalled();
            expect(undoable1.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.redo).toHaveBeenCalledTimes(1);
            expect(undoable4.undo).toHaveBeenCalledTimes(1);
            expect(undoable2.undo).not.toHaveBeenCalled();
        });

        test("get last undoable when moving", () => {
            history.goTo(3);
            expect(history.getLastUndo()).toBe(undoable3);
        });

        test("get last redoable when moving to 3", () => {
            history.goTo(3);
            expect(history.getLastRedo()).toBeUndefined();
        });

        test("get last redoable when moving to 4 and undo", () => {
            history.goTo(4);
            history.undo();
            expect(history.getLastRedo()).toBe(undoable4);
        });

        test("get last undoable message when move to 4", () => {
            undoable4.getUndoName = (): string => "foo";
            history.goTo(4);
            expect(history.getLastUndoMessage()).toBe("foo");
        });

        test("get last undoable message or empty when move to 2", () => {
            undoable1.getUndoName = (): string => "foo1";
            history.goTo(1);
            expect(history.getLastOrEmptyUndoMessage()).toBe("foo1");
        });

        test("get last redoable when moving to 4 and undo and delete 4", () => {
            history.goTo(4);
            history.undo();
            history.delete(4);
            expect(history.getLastRedo()).toBe(undoable3);
        });

        test("get last redoable message when moving to 2 and undo", () => {
            undoable2.getUndoName = (): string => "fooo2";
            history.goTo(2);
            history.undo();
            expect(history.getLastRedoMessage()).toBe("fooo2");
        });

        test("get last redoable or empty message when moving to 3 and undo", () => {
            undoable3.getUndoName = (): string => "fooo4";
            history.goTo(3);
            history.undo();
            expect(history.getLastRedoMessage()).toBe("fooo4");
        });

        test("go to initial state", () => {
            history.goTo(-1);
            expect(history.currentNode).toBeUndefined();
            expect(undoable0.undo).toHaveBeenCalledTimes(1);
            expect(undoable0.redo).not.toHaveBeenCalled();
            expect(undoable1.redo).not.toHaveBeenCalled();
            expect(undoable1.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.redo).not.toHaveBeenCalled();
            expect(undoable4.undo).toHaveBeenCalledTimes(1);
            expect(undoable2.undo).toHaveBeenCalledTimes(1);
        });

        test("go from initial to 0", () => {
            history.goTo(-1);
            history.goTo(0);
            expect(history.currentNode?.undoable).toBe(undoable0);
            expect(undoable0.undo).toHaveBeenCalledTimes(1);
            expect(undoable0.redo).toHaveBeenCalledTimes(1);
            expect(undoable1.redo).not.toHaveBeenCalled();
            expect(undoable1.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.undo).toHaveBeenCalledTimes(1);
            expect(undoable3.redo).not.toHaveBeenCalled();
            expect(undoable4.undo).toHaveBeenCalledTimes(1);
            expect(undoable2.undo).toHaveBeenCalledTimes(1);
        });

        test("delete 1", () => {
            history.delete(1);

            expect(history.currentNode?.undoable).toBe(undoable4);
            expect(history.undoableNodes[0]?.parent).toBeUndefined();
            expect(history.undoableNodes[0]?.children).toHaveLength(1);
            expect(history.undoableNodes[0]?.children[0]?.undoable).toBe(undoable2);
            expect(history.undoableNodes[1]).toBeUndefined();
            expect(history.undoableNodes[2]?.children).toHaveLength(2);
            expect(history.undoableNodes[2]?.children[0]?.undoable).toBe(undoable3);
            expect(history.undoableNodes[2]?.children[1]?.undoable).toBe(undoable4);
            expect(history.undoableNodes[2]?.parent?.undoable).toBe(undoable0);
            expect(history.undoableNodes[3]?.children).toHaveLength(0);
            expect(history.undoableNodes[3]?.parent?.undoable).toBe(undoable2);
            expect(history.undoableNodes[4]?.children).toHaveLength(0);
            expect(history.undoableNodes[4]?.parent?.undoable).toBe(undoable2);
        });

        test("delete 2", () => {
            history.delete(2);

            expect(history.currentNode).toBeUndefined();
            expect(history.undoableNodes[0]?.parent).toBeUndefined();
            expect(history.undoableNodes[0]?.children).toHaveLength(1);
            expect(history.undoableNodes[0]?.children[0]?.undoable).toBe(undoable1);
            expect(history.undoableNodes[1]?.children).toHaveLength(0);
            expect(history.undoableNodes[1]?.parent?.undoable).toBe(undoable0);
            expect(history.undoableNodes[2]).toBeUndefined();
            expect(history.undoableNodes[3]).toBeUndefined();
            expect(history.undoableNodes[4]).toBeUndefined();
        });

        test("delete 0", () => {
            history.delete(0);

            expect(history.currentNode).toBeUndefined();
            expect(history.undoableNodes[0]).toBeUndefined();
            expect(history.undoableNodes[1]).toBeUndefined();
            expect(history.undoableNodes[2]).toBeUndefined();
            expect(history.undoableNodes[3]).toBeUndefined();
            expect(history.undoableNodes[4]).toBeUndefined();
        });

        test("delete invalid 5", () => {
            history.delete(5);

            expect(history.currentNode?.undoable).toBe(undoable4);
            expect(history.undoableNodes[0]?.children).toHaveLength(2);
            expect(history.undoableNodes[1]?.children).toHaveLength(0);
            expect(history.undoableNodes[2]?.children).toHaveLength(2);
            expect(history.undoableNodes[3]?.children).toHaveLength(0);
            expect(history.undoableNodes[4]?.children).toHaveLength(0);
        });
    });
});
