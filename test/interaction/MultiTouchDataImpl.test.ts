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

import {MultiTouchDataImpl} from "../../src/impl/interaction/MultiTouchDataImpl";
import {SrcTgtTouchDataImpl} from "../../src/impl/interaction/SrcTgtTouchDataImpl";
import type {EventModifierData} from "../../src/api/interaction/EventModifierData";
import type {UnitInteractionData} from "../../src/api/interaction/UnitInteractionData";

let data: MultiTouchDataImpl;
let touchData: SrcTgtTouchDataImpl;
let touch: Touch;
let evt: EventModifierData & UnitInteractionData;

beforeEach(() => {
    data = new MultiTouchDataImpl();
    touch = {
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

    evt = {
        "altKey": true,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": true,
        "timeStamp": 17,
        "target": new EventTarget(),
        "currentTarget": new EventTarget()
    };

    touchData = new SrcTgtTouchDataImpl();
    touchData.copySrc(touch, evt);
    touchData.copyTgt(touch, evt);
});

test("touches collection is empty by default", () => {
    expect(data.touches).toHaveLength(0);
});

test("addTouchData", () => {
    data.addTouchData(touchData);
    expect(data.touches).toHaveLength(1);
    const element = data.touches[0];
    expect(element).toStrictEqual(touchData);
});

test("removeTouchData touch point exists", () => {
    data.addTouchData(touchData);
    data.removeTouchData(20);
    expect(data.touches).toHaveLength(0);
    expect(touchData).toStrictEqual(new SrcTgtTouchDataImpl());
});

test("removeTouchData touch point doesn't exist", () => {
    data.addTouchData(touchData);
    data.removeTouchData(6000);
    expect(data.touches).toHaveLength(1);
});

test("flush", () => {
    data.addTouchData(touchData);
    data.flush();
    expect(data.touches).toHaveLength(0);
    expect(touchData).toStrictEqual(new SrcTgtTouchDataImpl());
});

test("setTouch touch point exists", () => {
    data.addTouchData(touchData);
    const newTouch: Touch = {
        "altitudeAngle": 50,
        "azimuthAngle": 10,
        "force": 15,
        "identifier": 20,
        "radiusX": 25,
        "radiusY": 30,
        "rotationAngle": 35,
        "touchType": "stylus",
        "clientX": 11,
        "clientY": 12,
        "pageX": 100,
        "pageY": 14,
        "screenX": 0,
        "screenY": 0,
        "target": new EventTarget()
    };
    const newEvt: TouchEvent = new TouchEvent("touchstart");

    const newTouchData = new SrcTgtTouchDataImpl();
    newTouchData.copySrc(touch, evt);
    newTouchData.copyTgt(newTouch, newEvt);
    data.setTouch(newTouch, newEvt);

    expect(data.touches[0]).toStrictEqual(newTouchData);
});

test("setTouch touch point doesn't exist", () => {
    data.addTouchData(touchData);
    const newTouch: Touch = {
        "altitudeAngle": 50,
        "azimuthAngle": 10,
        "force": 15,
        "identifier": 6000,
        "radiusX": 25,
        "radiusY": 30,
        "rotationAngle": 35,
        "touchType": "stylus",
        "clientX": 11,
        "clientY": 12,
        "pageX": 100,
        "pageY": 14,
        "screenX": 0,
        "screenY": 0,
        "target": new EventTarget()
    };
    const newEvt: TouchEvent = new TouchEvent("touchstart");
    data.setTouch(newTouch, newEvt);

    expect(data.touches[0]).toStrictEqual(touchData);
});
