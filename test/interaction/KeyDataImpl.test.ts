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

import {KeyDataImpl} from "../../src/impl/interaction/KeyDataImpl";
import type {KeyData} from "../../src/api/interaction/KeyData";

let data: KeyDataImpl;
let defaultData: KeyDataImpl;
let newData: KeyData;

beforeEach(() => {
    data = new KeyDataImpl();

    newData = {
        "code": "KeyQ",
        "key": "KeyA",
        "location": 1,
        "repeat": false,
        "altKey": true,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": true,
        "timeStamp": 0,
        "target": null,
        "currentTarget": null
    } as KeyData;

    defaultData = new KeyDataImpl();
    defaultData.copy({
        "code": "",
        "key": "",
        "location": 0,
        "repeat": false,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false,
        "timeStamp": 0,
        "target": null,
        "currentTarget": null
    });
});

test("copy", () => {
    data.copy(newData);
    expect(data.code).toBe(newData.code);
    expect(data.key).toBe(newData.key);
    expect(data.location).toBe(newData.location);
    expect(data.repeat).toBe(newData.repeat);
    expect(data.altKey).toBe(newData.altKey);
    expect(data.ctrlKey).toBe(newData.ctrlKey);
    expect(data.metaKey).toBe(newData.metaKey);
    expect(data.shiftKey).toBe(newData.shiftKey);
});

test("default values", () => {
    expect(data).toStrictEqual(defaultData);
});

test("flush", () => {
    data.copy(newData);
    data.flush();
    expect(data).toStrictEqual(defaultData);
});


