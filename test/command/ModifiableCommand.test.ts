import {getModifiableCmdAttributes, isCmdModifiable, Modifiable, modifyCmdAttributes} from "../../src/interacto";
import {beforeEach, describe, expect, test} from "vitest";
import type {UndoableCommand} from "../../src/interacto";
import {CmdModifiableDouble, CmdModifiableDouble2, CmdModifiableDouble3, ExampleUndoableCmd} from "./StubCmd";

class CmdModifiableGet extends ExampleUndoableCmd {
    public theX = 10;

    @Modifiable
    public get x(): number {
        return this.theX;
    }

    public set x(value: number) {
        this.theX = value;
    }
}

describe("using a modifiable decorator on commands", () => {
    describe("and an undoable command", () => {
        let cmd: CmdModifiableDouble;

        beforeEach(() => {
            cmd = new CmdModifiableDouble();
            cmd.done();
        });

        test("can modify one property with @Modifiable", () => {
            const res = modifyCmdAttributes(cmd, {
                a: 21
            });

            expect(res).toBeTruthy();
            expect(cmd.a).toBe(21);
            expect(cmd.b).toBeFalsy();
            expect(cmd.c).toBe("foo");
        });

        test("can modify one property several times with @Modifiable", () => {
            modifyCmdAttributes(cmd, {
                a: 21
            });
            modifyCmdAttributes(cmd, {
                a: 22
            });

            expect(cmd.a).toBe(22);
        });

        test("can modify two properties with @Modifiable", () => {
            modifyCmdAttributes(cmd, {
                b: true,
                a: 42
            });

            expect(cmd.a).toBe(42);
            expect(cmd.b).toBeTruthy();
            expect(cmd.c).toBe("foo");
        });

        test("cannot modify one property without @Modifiable", () => {
            modifyCmdAttributes(cmd, {
                c: "yolo",
                a: 1
            });

            expect(cmd.a).toBe(1);
            expect(cmd.b).toBeFalsy();
            expect(cmd.c).toBe("foo");
        });

        test("does nothing since same value (1 attribute)", () => {
            const res = modifyCmdAttributes(cmd, {
                a: 0
            });

            expect(res).toBeFalsy();
        });

        test("does nothing since same value (2 attributes)", () => {
            const res = modifyCmdAttributes(cmd, {
                a: 0,
                b: true
            });

            expect(res).toBeTruthy();
            expect(cmd.b).toBeTruthy();
        });

        test("cannot modify one non-existing property", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modifyCmdAttributes(cmd as any, {
                c2: "yolo",
                a: -1
            });

            expect(cmd.a).toBe(-1);
            expect(cmd.b).toBeFalsy();
        });

        test("cannot modify one property with a incorrectly typed value", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modifyCmdAttributes(cmd as any, {
                a: "100",
                b: "200"
            });

            expect(cmd.a).toBe(0);
            expect(cmd.b).toBeFalsy();
        });

        test("get modifiable properties", () => {
            const attributes = getModifiableCmdAttributes(cmd);
            expect(attributes).toStrictEqual({"a": 0, "b": false});
        });

        test("get modifiable properties on getter", () => {
            const cmd2 = new CmdModifiableGet();
            const res = modifyCmdAttributes(cmd2, {
                "x": 42
            });
            expect(res).toBeTruthy();
            expect(cmd2.theX).toBe(42);
        });

        describe("and an undoable command with incorrect usages of Modifiable", () => {
            test("get modifiable properties does not include the ones badly typed", () => {
                expect(getModifiableCmdAttributes(new CmdModifiableDouble3())).toStrictEqual({});
            });
        });
    });

    describe("and an non-undoable command", () => {
        let cmd: CmdModifiableDouble2;

        beforeEach(() => {
            cmd = new CmdModifiableDouble2();
            cmd.done();
        });

        test("with a standard command", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modifyCmdAttributes(cmd as any, {
                a: 21
            });

            expect(cmd.a).toBe(0);
        });

        test("get modifiable properties", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const attributes = getModifiableCmdAttributes(cmd as any as UndoableCommand);
            expect(attributes).toStrictEqual({});
        });

        test("with not a set as cache", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(isCmdModifiable(cmd as any as UndoableCommand, "a")).toBeFalsy();
        });
    });
});
