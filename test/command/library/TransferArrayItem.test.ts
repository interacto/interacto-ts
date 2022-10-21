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

import {TransferArrayItem} from "../../../src/impl/command/library/TransferArrayItem";

describe("using a transfer array item command", () => {
    let cmd: TransferArrayItem<number>;
    let array1: Array<number>;
    let array2: Array<number>;

    beforeEach(() => {
        array1 = [0, 1, 2];
        array2 = [3, 4];
        cmd = new TransferArrayItem<number>(array1, array2, 0, 1, "Transfer array item");
    });

    test("canDo", () => {
        expect(cmd.canExecute()).toBeTruthy();
    });

    test("cannot Do Src Index 1 Too Low", () => {
        cmd = new TransferArrayItem<number>(array1, array2, -1, 0, "Transfer array item");
        expect(cmd.canExecute()).toBeFalsy();
    });

    test("cannot Do Src Index 1 Too High", () => {
        cmd = new TransferArrayItem<number>(array1, array2, 5, 0, "Transfer array item");
        expect(cmd.canExecute()).toBeFalsy();
    });

    test("cannot Do Src Index 2 Too Low", () => {
        cmd = new TransferArrayItem<number>(array1, array2, 0, -1, "Transfer array item");
        expect(cmd.canExecute()).toBeFalsy();
    });

    test("cannot Do Src Index 2 Too High", () => {
        cmd = new TransferArrayItem<number>(array1, array2, 0, 3, "Transfer array item");
        expect(cmd.canExecute()).toBeFalsy();
    });

    test("get UndoName", () => {
        expect(cmd.getUndoName()).toBe("Transfer array item");
    });

    test("redo", () => {
        cmd.redo();
        expect(array2[1]).toBe(0);
        expect(array1[0]).toBe(1);
    });

    test("execution", async () => {
        await cmd.execute();
        expect(array2[1]).toBe(0);
        expect(array1[0]).toBe(1);
    });

    test("undo", async () => {
        await cmd.execute();
        cmd.undo();
        expect(array2[1]).toBe(4);
        expect(array1[0]).toBe(0);
    });

    test("get SrcArray", () => {
        expect(cmd.srcArray).toStrictEqual(array1);
    });

    test("get TgtArray", () => {
        expect(cmd.tgtArray).toStrictEqual(array2);
    });

    test("set SrcArray", () => {
        cmd.srcArray = array2;
        expect(cmd.srcArray).toStrictEqual(array2);
    });

    test("set TgtArray", () => {
        cmd.tgtArray = array1;
        expect(cmd.tgtArray).toStrictEqual(array1);
    });

    test("get SrcIndex", () => {
        expect(cmd.srcIndex).toBe(0);
    });

    test("get TgtIndex", () => {
        expect(cmd.tgtIndex).toBe(1);
    });

    test("set SrcIndex", () => {
        cmd.srcIndex = 2;
        expect(cmd.srcIndex).toBe(2);
    });

    test("set TgtIndex", () => {
        cmd.tgtIndex = 2;
        expect(cmd.tgtIndex).toBe(2);
    });
});
