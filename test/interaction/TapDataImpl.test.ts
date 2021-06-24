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

import {TapDataImpl} from "../../src/impl/interaction/TapDataImpl";
import {TouchDataImpl} from "../../src/impl/interaction/TouchDataImpl";

let data: TapDataImpl;
let touchData: TouchDataImpl;

beforeEach(() => {
    data = new TapDataImpl();
    touchData = new TouchDataImpl();
    touchData.copy({
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
        "currentTarget": new EventTarget()
    });
});

test("taps collection is empty by default", () => {
    expect(data.taps).toHaveLength(0);
});

test("addTapData", () => {
    data.addTapData(touchData);
    expect(data.taps).toHaveLength(1);
    const element = data.taps[0];
    expect(element).toStrictEqual(touchData);
});

test("flush", () => {
    data.addTapData(touchData);
    data.flush();
    expect(data.taps).toHaveLength(0);
});
