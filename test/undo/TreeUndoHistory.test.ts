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

import {TreeUndoHistoryImpl} from "../../src/impl/undo/TreeUndoHistoryImpl";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock } from "jest-mock-extended";
import {TestScheduler} from "rxjs/testing";
import type {TreeUndoHistory} from "../../src/api/undo/TreeUndoHistory";
import type {Undoable} from "../../src/api/undo/Undoable";
import type {MockProxy} from "jest-mock-extended";

interface Undoable4Test extends Undoable {
    foo: number;
    bar: string;
}

describe("using a tree undo history", () => {
    let history: TreeUndoHistory;
    let undoable0: MockProxy<Undoable4Test> & Undoable4Test;
    let undoable1: MockProxy<Undoable4Test> & Undoable4Test;
    let undoable2: MockProxy<Undoable4Test> & Undoable4Test;

    beforeEach(() => {
        undoable0 = mock<Undoable4Test>({
            foo: 0
        });
        undoable1 = mock<Undoable4Test>({
            foo: 1
        });
        undoable2 = mock<Undoable4Test>({
            foo: 2
        });
    });

    afterEach(() => {
        history.clear();
        jest.clearAllMocks();
    });

    describe("using a standard tree history", () => {
        beforeEach(() => {
            history = new TreeUndoHistoryImpl();
        });

        test("option considersEqualCmds not activated", () => {
            expect(history.considersEqualCmds).toBeFalsy();
        })

        test("initial history is empty", () => {
            expect(history.undoableNodes).toHaveLength(0);
            expect(history.currentNode).toBe(history.root);
        });

        test("undo does nothing", () => {
            history.undo();
            expect(history.undoableNodes).toHaveLength(0);
            expect(history.currentNode).toBe(history.root);
        });

        test("go to empty ok", () => {
            history.goTo(0);
            expect(history.undoableNodes).toHaveLength(0);
            expect(history.currentNode).toBe(history.root);
        });

        test("delete invalid node ok", () => {
            history.delete(0);
            expect(history.undoableNodes).toHaveLength(0);
            expect(history.currentNode).toBe(history.root);
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

        test("undoable obs not null", () => {
            expect(history.undosObservable()).toBeDefined();
        });

        test("redoable obs not null", () => {
            expect(history.redosObservable()).toBeDefined();
        });

        test("get positions when empty", () => {
            expect(Array.from(history.getPositions().keys())).toHaveLength(1);
        });

        describe("and testing subscriptions", () => {
            let testScheduler: TestScheduler;

            beforeEach(() => {
                testScheduler = new TestScheduler((actual, expected) => {
                    expect(actual).toStrictEqual(expected);
                });
            });

            afterEach(() => {
                testScheduler.flush();
            });

            test("one add", () => {
                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a").subscribe(() => history.add(undoable0));

                    expectObservable(history.undosObservable())
                        .toBe("-a", {"a": undoable0});
                    expectObservable(history.redosObservable())
                        .toBe("-a", {"a": undefined});
                });
            });

            test("two adds", () => {
                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a-b", {"a": undoable0, "b": undoable1}).subscribe(v => history.add(v));

                    expectObservable(history.undosObservable()).toBe("-a-b",
                        {"a": undoable0, "b": undoable1});
                    expectObservable(history.redosObservable()).toBe("-a-b",
                        {"a": undefined, "b": undefined});
                });
            });

            test("one add one undo", () => {
                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a-b", {"a": () => history.add(undoable0), "b": () => history.undo()}).subscribe(v => {
                        v();
                    });

                    expectObservable(history.undosObservable()).toBe("-a-b",
                        {"a": undoable0, "b": undefined});
                    expectObservable(history.redosObservable()).toBe("-a-b",
                        {"a": undefined, "b": undoable0});
                });
            });

            test("one add one undo redo", () => {
                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a-b-c", {
                        "a": () => history.add(undoable0),
                        "b": () => history.undo(),
                        "c": () => history.redo()
                    }).subscribe(v => {
                        v();
                    });

                    expectObservable(history.undosObservable()).toBe("-a-b-c",
                        {"a": undoable0, "b": undefined, "c": undoable0});
                    expectObservable(history.redosObservable()).toBe("-a-b-c",
                        {"a": undefined, "b": undoable0, "c": undefined});
                });
            });

            test("three add then go to", () => {
                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a-b-c-d", {
                        "a": () => history.add(undoable0),
                        "b": () => history.add(undoable1),
                        "c": () => history.add(undoable2),
                        "d": () => history.goTo(0)
                    }).subscribe(v => {
                        v();
                    });

                    expectObservable(history.undosObservable()).toBe("-a-b-c-d",
                        {"a": undoable0, "b": undoable1, "c": undoable2, "d": undoable0});
                    expectObservable(history.redosObservable()).toBe("-a-b-c-d",
                        {"a": undefined, "b": undefined, "c": undefined, "d": undoable1});
                });
            });

            test("two add one undo one new add", () => {
                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a-b-c-d", {
                        "a": () => history.add(undoable0),
                        "b": () => history.add(undoable1),
                        "c": () => history.undo(),
                        "d": () => history.add(undoable2)
                    }).subscribe(v => {
                        v();
                    });

                    expectObservable(history.undosObservable()).toBe("-a-b-c-d",
                        {"a": undoable0, "b": undoable1, "c": undoable0, "d": undoable2});
                    expectObservable(history.redosObservable()).toBe("-a-b-c-d",
                        {"a": undefined, "b": undefined, "c": undoable1, "d": undefined});
                });
            });

            test("three add one, undo to root, redo to leaf", () => {
                const res2: Array<number> = [];
                undoable0.redo.mockImplementation(() => {
                    res2.push(0);
                });
                undoable1.redo.mockImplementation(() => {
                    res2.push(1);
                });
                undoable2.redo.mockImplementation(() => {
                    res2.push(2);
                });

                testScheduler.run(helpers => {
                    const {cold, expectObservable} = helpers;
                    cold("-a-b-c-d-e", {
                        "a": () => history.add(undoable0),
                        "b": () => history.add(undoable1),
                        "c": () => history.add(undoable2),
                        "d": () => history.goTo(-1),
                        "e": () => history.goTo(2),
                    }).subscribe(v => {
                        v();
                    });

                    expectObservable(history.undosObservable()).toBe("-a-b-c-d-e",
                        {"a": undoable0, "b": undoable1, "c": undoable2, "d": undefined, "e": undoable2});
                    expectObservable(history.redosObservable()).toBe("-a-b-c-d-e",
                        {"a": undefined, "b": undefined, "c": undefined, "d": undoable0, "e": undefined});
                });
                expect(res2).toStrictEqual([0, 1, 2]);
            });
        });

        describe("and using a single undoable", () => {
            beforeEach(() => {
                undoable0.getVisualSnapshot.mockImplementation((): string => "foo");
                history.add(undoable0);
            });

            test("path when not keeping path", () => {
                expect(history.path).toHaveLength(0);
            });

            test("get snapshot", () => {
                const foo = history.undoableNodes[0]?.visualSnapshot;
                expect(foo).toBe("foo");
            });

            test("width when one element", () => {
                const positions = history.getPositions();
                expect(Array.from(positions.keys())).toHaveLength(2);
                expect(positions.get(0)).toBe(0);
                expect(positions.get(-1)).toBe(0);
            });

            test("get last undoable when one element", () => {
                expect(history.getLastUndo()).toBe(undoable0);
            });

            test("add root works", () => {
                expect(history.undoableNodes).toHaveLength(1);
                expect(history.undoableNodes[0]).toBeDefined();
                expect(history.undoableNodes[0]?.undoable).toBe(undoable0);
                expect(history.currentNode).toBeDefined();
                expect(history.currentNode.undoable).toBe(undoable0);
            });

            test("undo works", () => {
                history.undo();
                expect(history.undoableNodes).toHaveLength(1);
                expect(history.undoableNodes[0]).toBeDefined();
                expect(history.currentNode).toBe(history.root);
                expect(undoable0.undo).toHaveBeenCalledTimes(1);
            });

            test("redo observation works", () => {
                const toRedos = new Array<Undoable | undefined>();
                const redosStream = history.redosObservable().subscribe((e: Undoable | undefined) => toRedos.push(e));

                history.undo();
                redosStream.unsubscribe();

                expect(toRedos).toHaveLength(1);
                expect(toRedos[0]).toStrictEqual(undoable0);
            });

            test("undo observation works", () => {
                const undos = new Array<Undoable | undefined>();
                const undosStream = history.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));

                history.add(undoable1);
                undosStream.unsubscribe();

                expect(undos).toHaveLength(1);
                expect(undos[0]).toStrictEqual(undoable1);
            });

            test("undo and redo observation works on multiple operations", () => {
                const undos = new Array<Undoable | undefined>();
                const redos = new Array<Undoable | undefined>();
                const undosStream = history.undosObservable().subscribe((e: Undoable | undefined) => undos.push(e));
                const redosStream = history.redosObservable().subscribe((e: Undoable | undefined) => redos.push(e));

                history.add(undoable1);
                history.undo();
                history.undo();
                history.redo();
                history.redo();
                undosStream.unsubscribe();
                redosStream.unsubscribe();

                expect(undos).toHaveLength(5);
                expect(undos[0]).toStrictEqual(undoable1);
                expect(undos[1]).toStrictEqual(undoable0);
                expect(undos[2]).toBeUndefined();
                expect(undos[3]).toStrictEqual(undoable0);
                expect(undos[4]).toStrictEqual(undoable1);
                expect(redos).toHaveLength(5);
                expect(redos[0]).toBeUndefined();
                expect(redos[1]).toStrictEqual(undoable1);
                expect(redos[2]).toStrictEqual(undoable0);
                expect(redos[3]).toStrictEqual(undoable1);
                expect(redos[4]).toBeUndefined();
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
                undoable0.getUndoName.mockImplementation((): string => "fooo");
                history.undo();
                expect(history.getLastRedoMessage()).toBe("fooo");
            });

            test("get last redoable message or empty when one element and ahs a redo", () => {
                undoable0.getUndoName.mockImplementation((): string => "barr");
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
                expect(history.undoableNodes[0]?.parent).toBe(history.root);
                expect(history.undoableNodes[1]?.parent).toBe(history.root);
                expect(history.undoableNodes[0]?.children).toHaveLength(0);
                expect(history.undoableNodes[1]?.children).toHaveLength(0);
                expect(history.currentNode.undoable).toBe(undoable1);
            });

            test("clear ok", () => {
                history.clear();
                expect(history.currentNode).toBe(history.root);
                expect(history.currentNode.children).toHaveLength(0);
                expect(history.undoableNodes).toHaveLength(0);
            });

            test("clear then add restarts ID at 0", () => {
                history.clear();
                history.add(undoable1);
                expect(history.undoableNodes[0]?.id).toBe(0);
            });

            test("go to itself", () => {
                history.goTo(0);

                expect(history.currentNode.undoable).toBe(undoable0);
                expect(history.undoableNodes).toHaveLength(1);
                expect(undoable0.undo).not.toHaveBeenCalled();
                expect(undoable0.redo).not.toHaveBeenCalled();
            });

            test("go to undoable1 from root", () => {
                history.undo();
                history.goTo(0);

                expect(history.currentNode.undoable).toBe(undoable0);
                expect(undoable0.undo).toHaveBeenCalledTimes(1);
                expect(undoable0.redo).toHaveBeenCalledTimes(1);
            });

            test("go to undefined ok", () => {
                history.goTo(1000);

                expect(history.currentNode.undoable).toBe(undoable0);
                expect(undoable0.undo).not.toHaveBeenCalled();
                expect(undoable0.redo).not.toHaveBeenCalled();
            });

            test("go to negative id ok", () => {
                history.goTo(-2);

                expect(history.currentNode.undoable).toBe(undoable0);
                expect(undoable0.undo).not.toHaveBeenCalled();
                expect(undoable0.redo).not.toHaveBeenCalled();
            });

            test("go to undoable1 from undoable2", () => {
                history.undo();
                history.add(undoable1);
                history.goTo(0);

                expect(history.currentNode.undoable).toBe(undoable0);
                expect(undoable1.undo).toHaveBeenCalledTimes(1);
                expect(undoable0.undo).toHaveBeenCalledTimes(1);
                expect(undoable0.redo).toHaveBeenCalledTimes(1);
            });

            test("delete negative node ID ok", () => {
                history.delete(-1);
                expect(history.undoableNodes).toHaveLength(1);
                expect(history.currentNode.undoable).toBe(undoable0);
            });

            test("delete invalid ok", () => {
                history.delete(1);
                expect(history.undoableNodes).toHaveLength(1);
                expect(history.currentNode.undoable).toBe(undoable0);
            });

            test("cannot delete the current branch", () => {
                history.delete(0);
                expect(history.undoableNodes).toHaveLength(1);
                expect(history.currentNode.undoable).toBe(undoable0);
            });

            test("export one add", () => {
                undoable0.foo = 2;
                const res = history.export(u => ({
                    "a": (u as Undoable4Test).foo
                }));

                expect(res.path).toHaveLength(0);
                expect(res.roots).toHaveLength(1);
                expect(res.roots.at(0)?.children).toHaveLength(0);
                expect(res.roots.at(0)?.id).toStrictEqual(history.root.children.at(0)?.id);
                expect(res.roots.at(0)?.undoable).toStrictEqual({
                    "a": 2
                });
            });

            test("import one add", () => {
                undoable0.foo = 2;
                const res = history.export(u => ({
                    "a": (u as Undoable4Test).foo
                }));

                history.import(res, dto => {
                    const u = mock<Undoable4Test>();
                    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                    u.foo = (dto as any).a as number;
                    return u;
                });

                expect(history.path).toHaveLength(0);
                expect(history.undoableNodes).toHaveLength(1);
                expect((history.undoableNodes[0]?.undoable as Undoable4Test).foo).toBe(2);
            });

            test("export two add", () => {
                history.add(undoable1);
                undoable0.foo = 4;
                undoable1.foo = 1;
                undoable0.bar = "a";
                undoable1.bar = "b";

                const res = history.export(u => ({
                    "c": (u as Undoable4Test).foo,
                    "d": (u as Undoable4Test).bar
                }));

                expect(res.path).toHaveLength(0);
                expect(res.roots).toHaveLength(1);
                expect(res.roots.at(0)?.children).toHaveLength(1);
                expect(res.roots.at(0)?.id).toStrictEqual(history.root.children.at(0)?.id);
                expect(res.roots.at(0)?.undoable).toStrictEqual({
                    "c": 4,
                    "d": "a"
                });
                expect(res.roots.at(0)?.children.at(0)?.children).toHaveLength(0);
                expect(res.roots.at(0)?.children.at(0)?.id).toStrictEqual(history.root.children.at(0)?.children.at(0)?.id);
                expect(res.roots.at(0)?.children.at(0)?.undoable).toStrictEqual({
                    "c": 1,
                    "d": "b"
                });
            });
        });

        describe("and using two roots", () => {
            beforeEach(() => {
                history.add(undoable0);
                history.goTo(-1);
                history.add(undoable1);
            });

            test("check structure", () => {
                expect(history.currentNode.undoable).toBe(undoable1);
                expect(history.undoableNodes).toHaveLength(2);
                expect(history.undoableNodes[0]?.parent).toBe(history.root);
                expect(history.undoableNodes[1]?.parent).toBe(history.root);
                expect(history.undoableNodes[0]?.children).toHaveLength(0);
                expect(history.undoableNodes[1]?.children).toHaveLength(0);
            });

            test("delete one root is OK", () => {
                history.goTo(-1);
                history.delete(1);
                expect(history.undoableNodes[0]?.undoable).toBe(undoable0);
                expect(history.undoableNodes[1]?.undoable).toBeUndefined();
            });

            test("positions OK", () => {
                const pos = history.getPositions();
                expect(pos.size).toBe(3);
                expect(pos.get(0)).toBe(0);
                expect(pos.get(-1)).toBe(1);
                expect(pos.get(1)).toBe(2);
            });

            test("export two roots", () => {
                undoable0.bar = "1";
                undoable1.bar = "2";

                const res = history.export(u => ({
                    "bb": (u as Undoable4Test).bar
                }));

                expect(res.path).toHaveLength(0);
                expect(res.roots).toHaveLength(2);
                expect(res.roots.at(0)?.children).toHaveLength(0);
                expect(res.roots.at(1)?.children).toHaveLength(0);

                expect(res.roots.at(0)?.id).toStrictEqual(history.root.children[0]?.id);
                expect(res.roots.at(0)?.undoable).toStrictEqual({
                    "bb": "1"
                });

                expect(res.roots.at(1)?.id).toStrictEqual(history.root.children[1]?.id);
                expect(res.roots.at(1)?.undoable).toStrictEqual({
                    "bb": "2"
                });
            });
        });

        describe("and using five undoable in different paths", () => {
            let undoable3: Undoable4Test;
            let undoable4: Undoable4Test;

            beforeEach(() => {
                undoable3 = mock<Undoable4Test>();
                undoable4 = mock<Undoable4Test>();
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

            test("export", () => {
                const res = history.export(() => ({}));

                expect(res.path).toHaveLength(0);
                expect(res.roots).toHaveLength(1);
                expect(res.roots.at(0)?.children).toHaveLength(2);
                expect(res.roots.at(0)?.children[0]?.children).toHaveLength(0);
                expect(res.roots.at(0)?.children[1]?.children).toHaveLength(2);
                expect(res.roots.at(0)?.children[1]?.children[0]?.children).toHaveLength(0);
                expect(res.roots.at(0)?.children[1]?.children[1]?.children).toHaveLength(0);

                expect(res.roots.at(0)?.id).toStrictEqual(history.root.children[0]?.id);
                expect(res.roots.at(0)?.children[0]?.id).toStrictEqual(history.root.children[0]?.children[0]?.id);
                expect(res.roots.at(0)?.children[1]?.id).toStrictEqual(history.root.children[0]?.children[1]?.id);
                expect(res.roots.at(0)?.children[1]?.children[0]?.id).toStrictEqual(history.root.children[0]?.children[1]?.children[0]?.id);
                expect(res.roots.at(0)?.children[1]?.children[1]?.id).toStrictEqual(history.root.children[0]?.children[1]?.children[1]?.id);
            });

            test("compute positions when multiples elements", () => {
                const positions = history.getPositions();
                expect(Array.from(positions.keys())).toHaveLength(6);
                expect(positions.get(-1)).toBe(1);
                expect(positions.get(0)).toBe(1);
                expect(positions.get(1)).toBe(0);
                expect(positions.get(2)).toBe(3);
                expect(positions.get(3)).toBe(2);
                expect(positions.get(4)).toBe(4);
            });

            test("get last undoable when multiple elements", () => {
                expect(history.getLastUndo()).toBe(undoable4);
            });

            test("tree structure is valid", () => {
                expect(history.currentNode.undoable).toBe(undoable4);
                expect(history.undoableNodes[0]?.parent).toBe(history.root);
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
                expect(history.currentNode.undoable).toBe(undoable1);
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
                expect(history.currentNode.undoable).toBe(undoable0);
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
                expect(history.currentNode.undoable).toBe(undoable3);
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
                undoable1.getUndoName.mockImplementation((): string => "foo1");
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
                undoable2.getUndoName.mockImplementation((): string => "fooo2");
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
                expect(history.currentNode).toBe(history.root);
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
                expect(history.currentNode.undoable).toBe(undoable0);
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

                expect(history.currentNode.undoable).toBe(undoable4);
                expect(history.undoableNodes[0]?.parent).toBe(history.root);
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
                history.goTo(0);
                history.delete(2);

                expect(history.currentNode.undoable).toBe(undoable0);
                expect(history.undoableNodes[0]?.parent).toBe(history.root);
                expect(history.undoableNodes[0]?.children).toHaveLength(1);
                expect(history.undoableNodes[0]?.children[0]?.undoable).toBe(undoable1);
                expect(history.undoableNodes[1]?.children).toHaveLength(0);
                expect(history.undoableNodes[1]?.parent?.undoable).toBe(undoable0);
                expect(history.undoableNodes[2]).toBeUndefined();
                expect(history.undoableNodes[3]).toBeUndefined();
                expect(history.undoableNodes[4]).toBeUndefined();
            });

            test("delete 0", () => {
                history.goTo(1);
                history.delete(2);

                expect(history.currentNode.undoable).toBe(undoable1);
                expect(history.undoableNodes[0]).toBeDefined();
                expect(history.undoableNodes[1]).toBeDefined();
                expect(history.undoableNodes[2]).toBeUndefined();
                expect(history.undoableNodes[3]).toBeUndefined();
                expect(history.undoableNodes[4]).toBeUndefined();
            });

            test("delete invalid 5", () => {
                history.delete(5);

                expect(history.currentNode.undoable).toBe(undoable4);
                expect(history.undoableNodes[0]?.children).toHaveLength(2);
                expect(history.undoableNodes[1]?.children).toHaveLength(0);
                expect(history.undoableNodes[2]?.children).toHaveLength(2);
                expect(history.undoableNodes[3]?.children).toHaveLength(0);
                expect(history.undoableNodes[4]?.children).toHaveLength(0);
            });
        });

        describe("and using 15 undoable in different paths", () => {
            let undoable3: Undoable;
            let undoable4: Undoable;
            let undoable5: Undoable;
            let undoable6: Undoable;
            let undoable7: Undoable;
            let undoable8: Undoable;
            let undoable9: Undoable;
            let undoable10: Undoable;
            let undoable11: Undoable;
            let undoable12: Undoable;
            let undoable13: Undoable;
            let undoable14: Undoable;

            beforeEach(() => {
                undoable3 = mock<Undoable>();
                undoable4 = mock<Undoable>();
                undoable5 = mock<Undoable>();
                undoable6 = mock<Undoable>();
                undoable7 = mock<Undoable>();
                undoable8 = mock<Undoable>();
                undoable9 = mock<Undoable>();
                undoable10 = mock<Undoable>();
                undoable11 = mock<Undoable>();
                undoable12 = mock<Undoable>();
                undoable13 = mock<Undoable>();
                undoable14 = mock<Undoable>();
                //                *
                //                0
                //        1              8
                //  2     5    6     9 10 11 12
                // 3 4  13 14  7
                history.add(undoable0);
                history.add(undoable1);
                history.add(undoable2);
                history.add(undoable3);
                history.undo();
                history.add(undoable4);
                history.undo();
                history.undo();
                history.add(undoable5);
                history.undo();
                history.add(undoable6);
                history.add(undoable7);
                history.undo();
                history.undo();
                history.undo();
                history.add(undoable8);
                history.add(undoable9);
                history.undo();
                history.add(undoable10);
                history.undo();
                history.add(undoable11);
                history.undo();
                history.add(undoable12);
                history.goTo(5);
                history.add(undoable13);
                history.undo();
                history.add(undoable14);
            });

            test("tree structure is valid", () => {
                expect(history.currentNode.undoable).toBe(undoable14);
                expect(history.undoableNodes[0]?.children).toHaveLength(2);
                expect(history.undoableNodes[1]?.children).toHaveLength(3);
                expect(history.undoableNodes[2]?.children).toHaveLength(2);
                expect(history.undoableNodes[3]?.children).toHaveLength(0);
                expect(history.undoableNodes[4]?.children).toHaveLength(0);
                expect(history.undoableNodes[5]?.children).toHaveLength(2);
                expect(history.undoableNodes[6]?.children).toHaveLength(1);
                expect(history.undoableNodes[7]?.children).toHaveLength(0);
                expect(history.undoableNodes[8]?.children).toHaveLength(4);
                expect(history.undoableNodes[9]?.children).toHaveLength(0);
                expect(history.undoableNodes[10]?.children).toHaveLength(0);
                expect(history.undoableNodes[11]?.children).toHaveLength(0);
                expect(history.undoableNodes[12]?.children).toHaveLength(0);
                expect(history.undoableNodes[13]?.children).toHaveLength(0);
                expect(history.undoableNodes[14]?.children).toHaveLength(0);
                expect(history.undoableNodes[0]?.parent).toBe(history.root);
                expect(history.undoableNodes[1]?.parent?.undoable).toBe(undoable0);
                expect(history.undoableNodes[2]?.parent?.undoable).toBe(undoable1);
                expect(history.undoableNodes[3]?.parent?.undoable).toBe(undoable2);
                expect(history.undoableNodes[4]?.parent?.undoable).toBe(undoable2);
                expect(history.undoableNodes[5]?.parent?.undoable).toBe(undoable1);
                expect(history.undoableNodes[6]?.parent?.undoable).toBe(undoable1);
                expect(history.undoableNodes[7]?.parent?.undoable).toBe(undoable6);
                expect(history.undoableNodes[8]?.parent?.undoable).toBe(undoable0);
                expect(history.undoableNodes[9]?.parent?.undoable).toBe(undoable8);
                expect(history.undoableNodes[10]?.parent?.undoable).toBe(undoable8);
                expect(history.undoableNodes[11]?.parent?.undoable).toBe(undoable8);
                expect(history.undoableNodes[12]?.parent?.undoable).toBe(undoable8);
                expect(history.undoableNodes[13]?.parent?.undoable).toBe(undoable5);
                expect(history.undoableNodes[14]?.parent?.undoable).toBe(undoable5);
            });

            test("compute positions when multiples elements", () => {
                const positions = history.getPositions();
                expect(Array.from(positions.keys())).toHaveLength(16);
                expect(positions.get(-1)).toBe(7);
                expect(positions.get(0)).toBe(7);
                expect(positions.get(1)).toBe(4);
                expect(positions.get(2)).toBe(1);
                expect(positions.get(3)).toBe(0);
                expect(positions.get(4)).toBe(2);
                expect(positions.get(5)).toBe(4);
                expect(positions.get(6)).toBe(6);
                expect(positions.get(7)).toBe(6);
                expect(positions.get(8)).toBe(10);
                expect(positions.get(9)).toBe(8);
                expect(positions.get(10)).toBe(9);
                expect(positions.get(11)).toBe(11);
                expect(positions.get(12)).toBe(12);
                expect(positions.get(13)).toBe(3);
                expect(positions.get(14)).toBe(5);
            });

            test("go to root", () => {
                history.goTo(0);
                expect(history.currentNode.id).toBe(0);
            });

            test("go to root then 4", () => {
                history.goTo(0);
                history.goTo(4);
                expect(history.currentNode.id).toBe(4);
            });

            test("go to 1 then 8", () => {
                history.goTo(1);
                history.goTo(8);
                expect(history.currentNode.id).toBe(8);
            });

            test("go to 2 then 3", () => {
                history.goTo(2);
                history.goTo(3);
                expect(history.currentNode.id).toBe(3);
            });
        });
    });

    describe("using a tree history that considers equal commands", () => {
        let undoableA: Undoable;
        let undoableB: Undoable;
        let undoableC: Undoable;
        let undoableD: Undoable;
        let undoableE: Undoable;
        let undoableF: Undoable;

        beforeEach(() => {
            history = new TreeUndoHistoryImpl(false, true);
            undoableA = mock<Undoable>();
            undoableB = mock<Undoable>();
            undoableC = mock<Undoable>();
            undoableD = mock<Undoable>();
            undoableE = mock<Undoable>();
            undoableF = mock<Undoable>();

            history.add(undoableA);
            history.add(undoableB);
        });

        test("option considersEqualCmds activated", () => {
            expect(history.considersEqualCmds).toBeTruthy();
        })

        test("does not create a new branch", () => {
            history.add(undoableC);
            history.add(undoableD);
            history.undo();
            history.undo();
            history.add(undoableF);
            // A *B - C D
            //      \ F
            history.undo();
            undoableC.equals = jest.fn(() => true);
            history.add(undoableE);

            expect(history.getLastUndo()).toBe(undoableC);
            expect(history.getLastRedo()).toBe(undoableD);
        });

        test("does not create a new branch, other config", () => {
            history.add(undoableF);
            history.undo();
            history.add(undoableC);
            history.add(undoableD);
            // A *B - F
            //      \ C D
            history.undo();
            history.undo();
            undoableC.equals = jest.fn(() => true);
            history.add(undoableE);

            expect(history.getLastUndo()).toBe(undoableC);
            expect(history.getLastRedo()).toBe(undoableD);
        });
    });
});
