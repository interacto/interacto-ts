import {getModifiableCmdAttributes, Modifiable, modifyCmdAttributes} from "../../../src/api/command/ModifiableCommand";
import {beforeEach, describe, test} from "@jest/globals";
import {ExampleUndoableCmd} from "../UndoableCommand.test";
import {StubCmd} from "../StubCmd";

class CmdModifiableDouble2 extends StubCmd {
    @Modifiable
    public a: number = 0;
}

class Foo {
    @Modifiable
    public a: number = 0;
}

class CmdModifiableDouble3 extends ExampleUndoableCmd {
    @Modifiable
    public a: Object = {};

    @Modifiable
    public b: Array<string> = [];

    @Modifiable
    public c: number | undefined = undefined;
}

class CmdModifiableDouble extends ExampleUndoableCmd {
    @Modifiable
    public a: number;

    @Modifiable
    public b: boolean;

    public c: string;

    public constructor() {
        super();
        this.a = 0;
        this.b = false
        this.c = "foo";
    }
}

describe("using a modifiable decorator on commands", () => {
    describe("and an undoable command", () => {
        let cmd: CmdModifiableDouble;

        beforeEach(() => {
            cmd = new CmdModifiableDouble();
        });

        test("can modify one property with @Modifiable", () => {
            modifyCmdAttributes(cmd, {
                a: 21
            });

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

        test("cannot modify one non-existing property", () => {
            modifyCmdAttributes(cmd, {
                c2: "yolo",
                a: -1
            });

            expect(cmd.a).toBe(-1);
            expect(cmd.b).toBeFalsy();
        });

        test("cannot modify one property with a incorrectly typed value", () => {
            modifyCmdAttributes(cmd, {
                a: "100",
                b: "200"
            });

            expect(cmd.a).toBe(0);
            expect(cmd.b).toBeFalsy();
        });

        test("get modifiable properties", () => {
            const attributes = getModifiableCmdAttributes(cmd);
            expect(attributes).toEqual(new Map<string, unknown>([["a", 0], ["b", false]]));
        });

        describe("and an undoable command with incorrect usages of Modifiable", () => {
            let cmd: CmdModifiableDouble3;

            beforeEach(() => {
                cmd = new CmdModifiableDouble3();
            });

            test("get modifiable properties does not include the ones badly typed", () => {
                expect(getModifiableCmdAttributes(cmd)).toEqual(new Map<string, unknown>());
            });
        });
    });

    describe("and an non-undoable command", () => {
        test("with a standard command", () => {
            const cmd = new CmdModifiableDouble2();
            modifyCmdAttributes(cmd, {
                a: 21
            });

            expect(cmd.a).toBe(0);
        });

        test("get modifiable properties", () => {
            const cmd = new CmdModifiableDouble2();
            const attributes = getModifiableCmdAttributes(cmd);
            expect(attributes).toEqual(new Map<string, unknown>());
        });

        test("with an object", () => {
            const foo = new Foo();
            modifyCmdAttributes(foo, {
                a: 21
            });

            expect(foo.a).toBe(0);
        });
    });
});
