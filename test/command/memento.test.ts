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

import {ExampleUndoableCmd} from "./StubCmd";
import {Memento} from "../../src/interacto";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";

class MementoCmd1 extends ExampleUndoableCmd {
    @Memento
    public x: number;

    @Memento
    public y: number;

    public newX: number;

    public constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.newX = 0;
    }

    public override execution(): void {
        this.x = 10;
        this.y = 20;
    }
}

describe("using a command have memento decorators", () => {
    let cmd1: MementoCmd1;

    beforeEach(() => {
        cmd1 = new MementoCmd1(1, 2);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("command execution works as expected", () => {
        void cmd1.execute();
        expect(cmd1.x).toBe(10);
        expect(cmd1.y).toBe(20);
        expect(cmd1.newX).toBe(0);
    });

    test("command undo uses automated memento to restore values", () => {
        void cmd1.execute();
        void cmd1.undo();
        expect(cmd1.x).toBe(1);
        expect(cmd1.y).toBe(2);
        expect(cmd1.newX).toBe(0);
    });

    test("command undo/redo works as expected", () => {
        void cmd1.execute();
        void cmd1.undo();
        void cmd1.redo();
        expect(cmd1.x).toBe(10);
        expect(cmd1.y).toBe(20);
        expect(cmd1.newX).toBe(0);
    });

    test("command undo/redo/undo uses automated memento to restore values", () => {
        void cmd1.execute();
        void cmd1.undo();
        void cmd1.redo();
        void cmd1.undo();
        expect(cmd1.x).toBe(1);
        expect(cmd1.y).toBe(2);
        expect(cmd1.newX).toBe(0);
    });
});
