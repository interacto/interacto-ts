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

import {peek, remove, removeAt} from "../../src/impl/util/ArrayUtil";

let arr: Array<string>;

beforeEach(() => {
    arr = ["foo", "bar", "yo"];
});

test("remove works", () => {
    remove(arr, "foo");
    expect(arr).toStrictEqual(["bar", "yo"]);
});

test("remove works 2", () => {
    remove(arr, "bar");
    expect(arr).toStrictEqual(["foo", "yo"]);
});

test("remove when item does not exist", () => {
    remove(arr, "ooo");
    expect(arr).toStrictEqual(["foo", "bar", "yo"]);
});

test("removeat with 0", () => {
    const res = removeAt(arr, 0);
    expect(res).toBe("foo");
    expect(arr).toStrictEqual(["bar", "yo"]);
});

test("removeat with last", () => {
    const res = removeAt(arr, 2);
    expect(res).toBe("yo");
    expect(arr).toStrictEqual(["foo", "bar"]);
});

[-1, 3].forEach(i => {
    test("removeat with invalid index", () => {
        const res = removeAt(arr, i);
        expect(res).toBeUndefined();
        expect(arr).toStrictEqual(["foo", "bar", "yo"]);
    });
});

test("peek of non empty array", () => {
    const res = peek(arr);
    expect(res).toBe("yo");
    expect(arr).toStrictEqual(["foo", "bar", "yo"]);
});

test("peek of empty array", () => {
    const array: Array<string> = [];
    const res = peek(array);
    expect(res).toBeUndefined();
});
