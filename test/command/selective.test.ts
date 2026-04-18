/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */

import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {CmdSelective1, CmdSelective2, CmdSeveralKeysSelective, CmdSelectiveInheritance, ExampleUndoableCmd} from "./StubCmd";
import {type LinearHistory, LinearHistoryImpl, isCmdSelective, Selective} from "../../src/interacto";

interface Bar {
    bar2: boolean;
}

interface Foo {
    foo: number;
    bar: Bar;
}

interface Paragraph {
    content: string;
    id: number;
}

interface Txt {
    paragraphs: Array<Paragraph>;
}

class CmdEditParagraph extends ExampleUndoableCmd {
    @Selective
    public paragraph: Paragraph;

    public txt: Txt;

    public constructor(para: Paragraph, txt: Txt) {
        super();
        this.paragraph = para;
        this.txt = txt;
    }
}

describe("using a selective command", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("does not work with a non-command object", () => {
        const logSpy = jest.spyOn(globalThis.console, "error");
        logSpy.mockReset();
        // eslint-disable-next-line new-cap
        Selective({}, "key");

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith("The @Selective decorator currently operates on Interacto commands only");
    });

    test("can have multiple selective keys", () => {
        const logSpy = jest.spyOn(globalThis.console, "error");
        logSpy.mockReset();
        // eslint-disable-next-line new-cap
        Selective(new CmdSeveralKeysSelective({}, {}), "key");

        expect(logSpy).not.toHaveBeenCalled();
    });

    test("command is selective", () => {
        expect(isCmdSelective(new CmdSeveralKeysSelective({}, {}))).toBeTruthy();
    });

    test("object is selective", () => {
        expect(isCmdSelective({})).toBeFalsy();
    });

    describe("and a linear history", () => {
        let history: LinearHistory;
        let cmd1: CmdSelective1;
        let cmd2: CmdSelective2;
        let cmd3: CmdSelectiveInheritance;
        let cmd4: CmdSeveralKeysSelective;
        let key: Foo;
        let key2: string;

        beforeEach(() => {
            key = {
                "foo": 1,
                "bar": {
                    "bar2": true
                }
            };
            key2 = "yolo";
            history = new LinearHistoryImpl();
            cmd1 = new CmdSelective1(key);
            cmd2 = new CmdSelective2(key);
            cmd3 = new CmdSelectiveInheritance(key);
            cmd4 = new CmdSeveralKeysSelective(key, key2);
        });

        afterEach(() => {
            history.clear();
        });

        test("works with an empty history", () => {
            const res = history.getSelectiveOf(key);
            expect(res).toStrictEqual([[], []]);
        });

        test("can find basic selective commands", () => {
            history.add(cmd1);
            history.add(new ExampleUndoableCmd());
            history.add(cmd2);
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(2);
            expect(res[1]).toHaveLength(0);
            expect(res[0]).toStrictEqual([cmd1, cmd2]);
        });

        test("can find a selective command having inheritance", () => {
            history.add(new ExampleUndoableCmd());
            history.add(cmd3);
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[1]).toHaveLength(0);
            expect(res[0]).toStrictEqual([cmd3]);
        });

        test("can find a selective command having several keys", () => {
            history.add(cmd4);
            history.add(new ExampleUndoableCmd());
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[1]).toHaveLength(0);
            expect(res[0]).toStrictEqual([cmd4]);
        });

        test("works when the key is modified", () => {
            history.add(cmd2);
            history.add(cmd1);
            history.add(cmd3);
            history.add(new ExampleUndoableCmd());
            key.bar.bar2 = false;
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(3);
            expect(res[1]).toHaveLength(0);
            expect(res[0]).toStrictEqual([cmd2, cmd1, cmd3]);
        });

        test("works when keys are different", () => {
            history.add(cmd1);
            history.add(new ExampleUndoableCmd());
            // Equals but not same object than `key`
            cmd3.key = {
                "foo": 1,
                "bar": {
                    "bar2": true
                }
            };
            history.add(cmd3);
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[1]).toHaveLength(0);
            expect(res[0]).toStrictEqual([cmd1]);
        });

        test("works when undo", () => {
            history.add(cmd2);
            history.add(cmd1);
            history.add(new ExampleUndoableCmd());
            history.add(cmd3);
            history.undo();
            history.undo();
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(2);
            expect(res[1]).toHaveLength(1);
            expect(res[0]).toStrictEqual([cmd2, cmd1]);
            expect(res[1]).toStrictEqual([cmd3]);
        });

        test("works when full undo", () => {
            history.add(cmd2);
            history.add(cmd1);
            history.undo();
            history.undo();
            const res = history.getSelectiveOf(key);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(0);
            expect(res[1]).toStrictEqual([cmd1, cmd2]);
        });

        test("selective works with string keys", () => {
            cmd1 = new CmdSelective1("foo");
            history.add(cmd2);
            history.add(cmd1);
            const res = history.getSelectiveOf("foo");
            expect(res).toHaveLength(2);
            expect(res[0]).toStrictEqual([cmd1]);
            expect(res[1]).toHaveLength(0);
        });

        test("selective works with number keys", () => {
            cmd2 = new CmdSelective2(42);
            history.add(cmd2);
            history.add(cmd1);
            const res = history.getSelectiveOf(42);
            expect(res).toHaveLength(2);
            expect(res[0]).toStrictEqual([cmd2]);
            expect(res[1]).toHaveLength(0);
        });

        test("getAllSelectiveObjects works with shared keys", () => {
            history.add(cmd2);
            history.add(cmd1);
            const res = [...history.getAllSelectiveObjects()];
            expect(res).toHaveLength(1);
            expect(res).toContain(cmd1.key);
            // expect(res).toContain(cmd2.otherKey);
        });

        test("getAllSelectiveObjects works with several keys", () => {
            cmd2 = new CmdSelective2("foo");
            history.add(cmd2);
            history.add(cmd1);
            const res = [...history.getAllSelectiveObjects()];
            expect(res).toHaveLength(2);
            expect(res).toContain(cmd1.key);
            expect(res).toContain(cmd2.otherKey);
        });

        test("getAllSelectiveObjects works by considering the redo stack", () => {
            cmd2 = new CmdSelective2("foo");
            history.add(cmd2);
            history.add(cmd1);
            history.undo();
            const res = [...history.getAllSelectiveObjects()];
            expect(res).toHaveLength(2);
            expect(res).toContain(cmd1.key);
            expect(res).toContain(cmd2.otherKey);
        });
    });

    describe("and a linear history and specific key comparison function", () => {
        let history: LinearHistory;
        let txt: Txt;
        let p1: Paragraph;
        let p2: Paragraph;
        let p3: Paragraph;
        let cmd1: CmdEditParagraph;
        let cmd2: CmdEditParagraph;
        let cmd3: CmdEditParagraph;
        let cmd4: CmdEditParagraph;
        let cmd5: CmdEditParagraph;

        beforeEach(() => {
            history = new LinearHistoryImpl();
            p1 = {
                id: 1,
                content: "foo bar. Yolo."
            };
            p2 = {
                id: 2,
                content: "A second paragraph"
            };
            p3 = {
                id: 3,
                content: "A third paragraph"
            };
            txt = {
                paragraphs: [p1, p2, p3]
            };
            cmd1 = new CmdEditParagraph(p1, txt);
            cmd2 = new CmdEditParagraph(p2, txt);
            cmd3 = new CmdEditParagraph(p3, txt);
            cmd4 = new CmdEditParagraph(p1, txt);
            cmd5 = new CmdEditParagraph(p1, txt);

            history.add(cmd1);
            history.add(cmd2);
            history.add(cmd3);
            history.add(cmd4);
            history.add(cmd5);
        });

        afterEach(() => {
            history.clear();
        });

        test("can select commands using a specific comparison function", () => {
            const res = history.getSelectiveOf(p1, (a, b) => a.id === b.id);
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(3);
            expect(res[1]).toHaveLength(0);
            expect(res[0]).toStrictEqual([cmd1, cmd4, cmd5]);
        });
    });
});
