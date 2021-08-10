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
import {SrcTgtTouchDataImpl} from "../../src/impl/interaction/SrcTgtTouchDataImpl";
import type {EventModifierData} from "../../src/api/interaction/EventModifierData";
import type {UnitInteractionData} from "../../src/api/interaction/UnitInteractionData";

let data: SrcTgtTouchDataImpl;
let touchSrc: Touch;
let touchTgt: Touch;
let evt1: EventModifierData & UnitInteractionData;
let evt2: EventModifierData & UnitInteractionData;

beforeEach(() => {
    data = new SrcTgtTouchDataImpl();
    touchSrc = {
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
        "target": new EventTarget()
    };

    touchTgt = {
        "altitudeAngle": 5,
        "azimuthAngle": 10,
        "force": 15,
        "identifier": 20,
        "radiusX": 25,
        "radiusY": 30,
        "rotationAngle": 35,
        "touchType": "stylus",
        "clientX": 12,
        "clientY": 14,
        "pageX": 16,
        "pageY": 18,
        "screenX": 18,
        "screenY": 20,
        "target": new EventTarget()
    };

    evt1 = {
        "altKey": true,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": true,
        "timeStamp": 10,
        "target": new EventTarget(),
        "currentTarget": new EventTarget()
    };

    evt2 = {
        "altKey": true,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": true,
        "timeStamp": 20,
        "target": new EventTarget(),
        "currentTarget": new EventTarget()
    };

    data.copySrc(touchSrc, evt1);
    data.copyTgt(touchTgt, evt2);
});

test("flush", () => {
    data.flush();
    expect(data.src).toStrictEqual(new TouchDataImpl());
});

test("diffClientX", () => {
    expect(data.diffClientX).toStrictEqual(1);
});

test("diffClientY", () => {
    expect(data.diffClientY).toStrictEqual(2);
});

test("diffPageX", () => {
    expect(data.diffPageX).toStrictEqual(3);
});

test("diffPageY", () => {
    expect(data.diffPageY).toStrictEqual(4);
});

test("diffScreenX", () => {
    expect(data.diffScreenX).toStrictEqual(3);
});

test("diffScreenY", () => {
    expect(data.diffScreenY).toStrictEqual(4);
});

test("duration", () => {
    expect(data.duration).toStrictEqual(10);
});

test("velocity", () => {
    // velocity should be sqrt(deltaX^2 + deltaY^2) / velocity * 1000 = sqrt(16 + 9) / 10 * 1000 = 500
    expect(data.velocity).toStrictEqual(500);
});

test("isHorizontal OK", () => {
    expect(data.isHorizontal(5)).toBeTruthy();
});

test("isHorizontal KO", () => {
    expect(data.isHorizontal(2)).toBeFalsy();
});

test("isVertical OK", () => {
    expect(data.isVertical(5)).toBeTruthy();
});

test("isVertical KO", () => {
    expect(data.isVertical(2)).toBeFalsy();
});
