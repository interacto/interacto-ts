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

import {TouchDataImpl} from "../../src/impl/interaction/TouchDataImpl";
import type {TouchData} from "../../src/api/interaction/TouchData";
import type {EventModifierData} from "../../src/api/interaction/EventModifierData";
import type {UnitInteractionData} from "../../src/api/interaction/UnitInteractionData";

let data: TouchDataImpl;
let defaultData: TouchDataImpl;
let newData: TouchData;
let allTouches: Array<TouchData>;
let evt: EventModifierData & UnitInteractionData;

beforeEach(() => {
    const t1 = new TouchDataImpl();
    const t2 = new TouchDataImpl();
    t1.copy({
        "altitudeAngle": 15,
        "azimuthAngle": 110,
        "force": 115,
        "identifier": 210,
        "radiusX": 215,
        "radiusY": 310,
        "rotationAngle": 315,
        "touchType": "stylus",
        "clientX": 111,
        "clientY": 121,
        "pageX": 131,
        "pageY": 114,
        "screenX": 151,
        "screenY": 161,
        "altKey": false,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": false,
        "timeStamp": 171,
        "target": new EventTarget(),
        "currentTarget": new EventTarget(),
        "allTouches": []
    });
    t2.copy({
        "altitudeAngle": 154,
        "azimuthAngle": 1140,
        "force": 1145,
        "identifier": 2140,
        "radiusX": 2145,
        "radiusY": 3140,
        "rotationAngle": 3415,
        "touchType": "stylus",
        "clientX": 1141,
        "clientY": 1241,
        "pageX": 1341,
        "pageY": 1144,
        "screenX": 1514,
        "screenY": 1641,
        "altKey": false,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": false,
        "timeStamp": 1371,
        "target": new EventTarget(),
        "currentTarget": new EventTarget(),
        "allTouches": []
    });
    allTouches = [t1, t2];
    data = new TouchDataImpl();
    newData = {
        "altitudeAngle": 5,
        "azimuthAngle": 10,
        "force": 15,
        "identifier": 20,
        "radiusX": 25,
        "radiusY": 30,
        "rotationAngle": 35,
        "touchType": "stylus",
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
        allTouches
    };
    defaultData = new TouchDataImpl();
    defaultData.copy({
        "altitudeAngle": 0,
        "azimuthAngle": 0,
        "force": 0,
        "identifier": 0,
        "radiusX": 0,
        "radiusY": 0,
        "rotationAngle": 0,
        "touchType": "direct",
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
        "allTouches": []
    });
    evt = {
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false,
        "timeStamp": 50,
        "target": null,
        "currentTarget": null
    };
});

test("default values", () => {
    expect(data).toStrictEqual(defaultData);
});
test("copy", () => {
    data.copy(newData);
    expect(data.altitudeAngle).toBe(newData.altitudeAngle);
    expect(data.azimuthAngle).toBe(newData.azimuthAngle);
    expect(data.force).toBe(newData.force);
    expect(data.identifier).toBe(newData.identifier);
    expect(data.radiusX).toBe(newData.radiusX);
    expect(data.radiusY).toBe(newData.radiusY);
    expect(data.rotationAngle).toBe(newData.rotationAngle);
    expect(data.touchType).toStrictEqual(newData.touchType);
    expect(data.rotationAngle).toBe(newData.rotationAngle);
    expect(data.clientX).toBe(newData.clientX);
    expect(data.clientY).toBe(newData.clientY);
    expect(data.pageX).toBe(newData.pageX);
    expect(data.pageY).toBe(newData.pageY);
    expect(data.screenX).toBe(newData.screenX);
    expect(data.screenY).toBe(newData.screenY);
    expect(data.ctrlKey).toBe(newData.ctrlKey);
    expect(data.metaKey).toBe(newData.metaKey);
    expect(data.shiftKey).toBe(newData.shiftKey);
    expect(data.timeStamp).toBe(newData.timeStamp);
    expect(data.target).toStrictEqual(newData.target);
    expect(data.currentTarget).toStrictEqual(newData.currentTarget);
    expect(data.allTouches).toStrictEqual(allTouches);
});

test("flush", () => {
    data.copy(newData);
    data.flush();
    expect(data).toStrictEqual(defaultData);
});

test("mergeTouchEventData", () => {
    data.copy(newData);
    const merged = TouchDataImpl.mergeTouchEventData(data as Touch, evt, []);
    expect(merged.altitudeAngle).toBe(data.altitudeAngle);
    expect(merged.azimuthAngle).toBe(data.azimuthAngle);
    expect(merged.force).toBe(data.force);
    expect(merged.identifier).toBe(data.identifier);
    expect(merged.radiusX).toBe(data.radiusX);
    expect(merged.radiusY).toBe(data.radiusY);
    expect(merged.rotationAngle).toBe(data.rotationAngle);
    expect(merged.touchType).toStrictEqual(data.touchType);
    expect(merged.rotationAngle).toBe(data.rotationAngle);
    expect(merged.clientX).toBe(data.clientX);
    expect(merged.clientY).toBe(data.clientY);
    expect(merged.pageX).toBe(data.pageX);
    expect(merged.pageY).toBe(data.pageY);
    expect(merged.screenX).toBe(data.screenX);
    expect(merged.screenY).toBe(data.screenY);
    expect(merged.ctrlKey).toBe(evt.ctrlKey);
    expect(merged.metaKey).toBe(evt.metaKey);
    expect(merged.shiftKey).toBe(evt.shiftKey);
    expect(merged.timeStamp).toBe(evt.timeStamp);
    expect(merged.target).toStrictEqual(data.target);
    expect(merged.currentTarget).toStrictEqual(evt.currentTarget);
});

