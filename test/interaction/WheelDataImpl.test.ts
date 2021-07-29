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

import type {WheelData} from "../../src/api/interaction/WheelData";
import {WheelDataImpl} from "../../src/impl/interaction/WheelDataImpl";

let data: WheelDataImpl;
let newData: WheelData;
let defaultData: WheelDataImpl;

beforeEach(() => {
    data = new WheelDataImpl();
    newData = {
        "button": 1,
        "buttons": 2,
        "movementX": 20,
        "movementY": 40,
        "offsetX": 10,
        "offsetY": 30,
        "relatedTarget": new EventTarget(),
        "clientX": 11,
        "clientY": 12,
        "pageX": 13,
        "pageY": 14,
        "screenX": 15,
        "screenY": 16,
        "altKey": true,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": true,
        "timeStamp": 17,
        "target": new EventTarget(),
        "currentTarget": new EventTarget(),
        "deltaX": 18,
        "deltaY": 19,
        "deltaZ": 20,
        "deltaMode": 21
    } as WheelData;
    defaultData = new WheelDataImpl();
    defaultData.copy({
        "button": 0,
        "buttons": 0,
        "movementX": 0,
        "movementY": 0,
        "offsetX": 0,
        "offsetY": 0,
        "relatedTarget": null,
        "clientX": 0,
        "clientY": 0,
        "pageX": 0,
        "pageY": 0,
        "screenX": 0,
        "screenY": 0,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false,
        "timeStamp": 0,
        "target": null,
        "currentTarget": null,
        "deltaX": 0,
        "deltaY": 0,
        "deltaZ": 0,
        "deltaMode": 0
    });
});

test("copy", () => {
    data.copy(newData);
    expect(data.button).toBe(newData.button);
    expect(data.buttons).toBe(newData.buttons);
    expect(data.movementX).toBe(newData.movementX);
    expect(data.movementY).toBe(newData.movementY);
    expect(data.offsetX).toBe(newData.offsetX);
    expect(data.offsetY).toBe(newData.offsetY);
    expect(data.relatedTarget).toStrictEqual(newData.relatedTarget);
    expect(data.clientX).toBe(newData.clientX);
    expect(data.clientY).toBe(newData.clientY);
    expect(data.pageX).toStrictEqual(newData.pageX);
    expect(data.pageY).toStrictEqual(newData.pageY);
    expect(data.screenX).toStrictEqual(newData.screenX);
    expect(data.screenY).toStrictEqual(newData.screenY);
    expect(data.ctrlKey).toBe(newData.ctrlKey);
    expect(data.metaKey).toBe(newData.metaKey);
    expect(data.shiftKey).toStrictEqual(newData.shiftKey);
    expect(data.timeStamp).toStrictEqual(newData.timeStamp);
    expect(data.target).toStrictEqual(newData.target);
    expect(data.currentTarget).toStrictEqual(newData.currentTarget);
    expect(data.deltaX).toBe(newData.deltaX);
    expect(data.deltaY).toBe(newData.deltaY);
    expect(data.deltaZ).toBe(newData.deltaZ);
    expect(data.deltaMode).toBe(newData.deltaMode);
});

test("default values", () => {
    expect(data).toStrictEqual(defaultData);
});

test("flush", () => {
    data.copy(newData);
    data.flush();
    expect(data).toStrictEqual(defaultData);
});


