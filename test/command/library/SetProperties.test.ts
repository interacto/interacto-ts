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

import {SetProperties} from "../../../src/impl/command/library/SetProperties";

class SecondStubSetProp {
    public val: Array<number> = [];
}

class StubForSetProp {
    public foo = 0;

    public bar: SecondStubSetProp = new SecondStubSetProp();

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public 5: number;

    private _foo2 = "";

    public get foo2(): string {
        return this._foo2;
    }

    public set foo2(val: string) {
        this._foo2 = val;
    }
}

describe("using a set properties command", () => {
    let obj: StubForSetProp;
    let obj2: SecondStubSetProp;

    beforeEach(() => {
        obj2 = new SecondStubSetProp();
        obj = new StubForSetProp();
        obj.bar = obj2;
        obj.foo = -1;
        obj.foo2 = "yoo";
        obj["5"] = 3;
    });

    describe("using properties", () => {
        let cmd: SetProperties<StubForSetProp>;

        beforeEach(() => {
            cmd = new SetProperties(obj, {
                "foo2": "fooo",
                "foo": 1,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "5": 6
            });
        });

        test("newvalues given in constructor", () => {
            expect(cmd.newvalues).toStrictEqual({
                "foo2": "fooo",
                "foo": 1,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "5": 6
            });
        });

        test("execute works", async () => {
            const res = await cmd.execute();
            cmd.done();

            expect(res).toBeTruthy();
            expect(cmd.hadEffect()).toBeTruthy();
            expect(obj.foo).toBe(1);
            expect(obj.foo2).toBe("fooo");
            expect(obj["5"]).toBe(6);
            expect(obj.bar).toBe(obj2);
        });

        test("execute works when set again", async () => {
            cmd.newvalues = {
                "foo2": "ffooo",
                "foo": 2
            };
            const res = await cmd.execute();
            cmd.done();

            expect(res).toBeTruthy();
            expect(cmd.hadEffect()).toBeTruthy();
            expect(obj.foo).toBe(2);
            expect(obj.foo2).toBe("ffooo");
            expect(obj["5"]).toBe(6);
            expect(obj.bar).toBe(obj2);
        });

        test("undo works", async () => {
            await cmd.execute();
            cmd.undo();
            expect(obj.foo).toBe(-1);
            expect(obj.foo2).toBe("yoo");
            expect(obj["5"]).toBe(3);
            expect(obj.bar).toBe(obj2);
        });

        test("redo works", async () => {
            await cmd.execute();
            cmd.undo();
            cmd.redo();
            expect(obj.foo).toBe(1);
            expect(obj.foo2).toBe("fooo");
            expect(obj["5"]).toBe(6);
            expect(obj.bar).toBe(obj2);
        });
    });
});
