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

let cmd: TransferArrayItem<number>;
let array1: Array<number>;
let array2: Array<number>;

beforeEach(() => {
    array1 = [0, 1, 2];
    array2 = [3, 4];
    cmd = new TransferArrayItem<number>(array1, array2, 0, 1, "Transfer array item");
});

test("testCanDo", () => {
    expect(cmd.canExecute()).toBeTruthy();
});

test("testCannotDoSrcIndex1TooLow", () => {
    cmd = new TransferArrayItem<number>(array1, array2, -1, 0, "Transfer array item");
    expect(cmd.canExecute()).toBeFalsy();
});

test("testCannotDoSrcIndex1TooHigh", () => {
    cmd = new TransferArrayItem<number>(array1, array2, 5, 0, "Transfer array item");
    expect(cmd.canExecute()).toBeFalsy();
});

test("testCannotDoSrcIndex2TooLow", () => {
    cmd = new TransferArrayItem<number>(array1, array2, 0, -1, "Transfer array item");
    expect(cmd.canExecute()).toBeFalsy();
});

test("testCannotDoSrcIndex2TooHigh", () => {
    cmd = new TransferArrayItem<number>(array1, array2, 0, 3, "Transfer array item");
    expect(cmd.canExecute()).toBeFalsy();
});

test("testGetUndoName", () => {
    expect(cmd.getUndoName()).toStrictEqual("Transfer array item");
});

test("testRedo", () => {
    cmd.redo();
    expect(array2[1]).toStrictEqual(0);
    expect(array1[0]).toStrictEqual(1);
});

test("testExecution", async () => {
    await cmd.execute();
    expect(array2[1]).toStrictEqual(0);
    expect(array1[0]).toStrictEqual(1);
});

test("testUndo", async () => {
    await cmd.execute();
    cmd.undo();
    expect(array2[1]).toStrictEqual(4);
    expect(array1[0]).toStrictEqual(0);
});

test("testGetSrcArray", () => {
    expect(cmd.getSrcArray()).toStrictEqual(array1);
});

test("testGetTgtArray", () => {
    expect(cmd.getTgtArray()).toStrictEqual(array2);
});

test("testSetSrcArray", () => {
    cmd.setSrcArray(array2);
    expect(cmd.getSrcArray()).toStrictEqual(array2);
});

test("testSetTgtArray", () => {
    cmd.setTgtArray(array1);
    expect(cmd.getTgtArray()).toStrictEqual(array1);
});

test("testGetSrcIndex", () => {
    expect(cmd.getSrcIndex()).toStrictEqual(0);
});

test("testGetTgtIndex", () => {
    expect(cmd.getTgtIndex()).toStrictEqual(1);
});

test("testSetSrcIndex", () => {
    cmd.setSrcIndex(2);
    expect(cmd.getSrcIndex()).toStrictEqual(2);
});

test("testSetTgtIndex", () => {
    cmd.setTgtIndex(2);
    expect(cmd.getTgtIndex()).toStrictEqual(2);
});
