/*
 * Interacto
 * Copyright (C) 2019 Arnaud Blouin
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {SetProperty} from "../../../src/impl/command/library/SetProperty";

class SecondStubSetProp {
    public val: Array<number> = [];
}

class StubForSetProp {
    public foo = 0;

    public bar: SecondStubSetProp = new SecondStubSetProp();

    private _foo2 = "";

    public get foo2(): string {
        return this._foo2;
    }

    public set foo2(val: string) {
        this._foo2 = val;
    }
}

describe("using a set property command", () => {
    let obj: StubForSetProp;

    beforeEach(() => {
        obj = new StubForSetProp();
    });

    describe("using a public number property", () => {
        let cmd: SetProperty<StubForSetProp, "foo">;

        beforeEach(() => {
            cmd = new SetProperty(obj, "foo", 3);
        });

        test("execute works", async () => {
            const res = await cmd.execute();
            cmd.done();

            expect(res).toBeTruthy();
            expect(cmd.hadEffect()).toBeTruthy();
            expect(obj.foo).toBe(3);
        });

        test("undo works", async () => {
            obj.foo = 1;
            await cmd.execute();
            cmd.undo();
            expect(obj.foo).toBe(1);
        });

        test("redo works", async () => {
            obj.foo = 2;
            await cmd.execute();
            cmd.undo();
            cmd.redo();
            expect(obj.foo).toBe(3);
        });

        test("undo name", () => {
            expect(cmd.getUndoName()).toBe("Set 'foo' value: 3");
        });
    });

    describe("using a public string getter/setter", () => {
        let cmd: SetProperty<StubForSetProp, "foo2">;

        beforeEach(() => {
            cmd = new SetProperty(obj, "foo2", "yolo");
        });

        test("execute works", async () => {
            const res = await cmd.execute();
            cmd.done();

            expect(res).toBeTruthy();
            expect(cmd.hadEffect()).toBeTruthy();
            expect(obj.foo2).toBe("yolo");
        });

        test("execute works when set again", async () => {
            cmd.newvalue = "yoo";
            const res = await cmd.execute();
            cmd.done();

            expect(res).toBeTruthy();
            expect(cmd.hadEffect()).toBeTruthy();
            expect(obj.foo2).toBe("yoo");
        });

        test("undo works", async () => {
            obj.foo2 = "fooo";
            await cmd.execute();
            cmd.undo();
            expect(obj.foo2).toBe("fooo");
        });

        test("redo works", async () => {
            obj.foo2 = "fooo22";
            await cmd.execute();
            cmd.undo();
            cmd.redo();
            expect(obj.foo2).toBe("yolo");
        });

        test("undo name", () => {
            expect(cmd.getUndoName()).toBe("Set 'foo2' value: yolo");
        });
    });

    describe("using a public object property", () => {
        let cmd: SetProperty<StubForSetProp, "bar">;
        let obj2: SecondStubSetProp;

        beforeEach(() => {
            obj2 = new SecondStubSetProp();
            obj2.val = [1, 2, 3];
            cmd = new SetProperty(obj, "bar", obj2);
        });

        test("execute works", async () => {
            const res = await cmd.execute();
            cmd.done();

            expect(res).toBeTruthy();
            expect(cmd.hadEffect()).toBeTruthy();
            expect(obj.bar).toBe(obj2);
        });

        test("undo works", async () => {
            const obj3 = new SecondStubSetProp();
            obj3.val = [4, 5];
            obj.bar = obj3;
            await cmd.execute();
            cmd.undo();
            expect(obj.bar).toBe(obj3);
        });

        test("redo works", async () => {
            const obj3 = new SecondStubSetProp();
            obj3.val = [4, 5, 0];
            obj.bar = obj3;
            await cmd.execute();
            cmd.undo();
            cmd.redo();
            expect(obj.bar).toBe(obj2);
        });

        test("undo name", () => {
            expect(cmd.getUndoName()).toBe("Set 'bar' value: [object Object]");
        });
    });
});
