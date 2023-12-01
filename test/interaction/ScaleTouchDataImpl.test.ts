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

import {ScaleTouchDataImpl} from "../../src/impl/interaction/ScaleTouchDataImpl";
import type {EventModifierData, UnitInteractionData} from "../../src/interacto";

describe("using a scale touch data", () => {
    let data: ScaleTouchDataImpl;
    let touchSrc1: Touch;
    let touchSrc2: Touch;
    let touchTgt1: Touch;
    let touchTgt2: Touch;
    let evt: EventModifierData & UnitInteractionData;

    beforeEach(() => {
        data = new ScaleTouchDataImpl();

        touchSrc1 = {
            "force": 15,
            "identifier": 20,
            "radiusX": 25,
            "radiusY": 30,
            "rotationAngle": 35,
            "clientX": 11,
            "clientY": 12,
            "pageX": 13,
            "pageY": 14,
            "screenX": 15,
            "screenY": 16,
            "target": new EventTarget()
        };

        touchTgt1 = {
            "force": 15,
            "identifier": 20,
            "radiusX": 25,
            "radiusY": 30,
            "rotationAngle": 35,
            "clientX": 12,
            "clientY": 14,
            "pageX": 16,
            "pageY": 18,
            "screenX": 20,
            "screenY": 22,
            "target": new EventTarget()
        };

        touchSrc2 = {
            "force": 15,
            "identifier": 21,
            "radiusX": 25,
            "radiusY": 30,
            "rotationAngle": 35,
            "clientX": 11,
            "clientY": 12,
            "pageX": 13,
            "pageY": 14,
            "screenX": 10,
            "screenY": 11,
            "target": new EventTarget()
        };

        touchTgt2 = {
            "force": 15,
            "identifier": 21,
            "radiusX": 25,
            "radiusY": 30,
            "rotationAngle": 35,
            "clientX": 12,
            "clientY": 14,
            "pageX": 16,
            "pageY": 18,
            "screenX": 5,
            "screenY": 6,
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
    });

    test("scalingRatio OK", () => {
        data.initTouch(touchSrc1, evt, []);
        data.initTouch(touchSrc2, evt, []);
        data.copyTouch(touchTgt1, evt, []);
        data.copyTouch(touchTgt2, evt, []);

        expect(data.scalingRatio(0.72)).toBeCloseTo(3.1018);
    });

    test("scalingRatio undefined invalid number of touches", () => {
        data.initTouch(touchSrc1, evt, []);
        data.copyTouch(touchTgt1, evt, []);

        expect(data.scalingRatio(1)).toBe(0);
    });

    test("scalingRatio undefined same direction", () => {
        data.initTouch(touchSrc1, evt, []);
        data.initTouch({...touchSrc1, "identifier": touchSrc1.identifier + 1}, evt, []);
        data.copyTouch(touchTgt1, evt, []);
        data.copyTouch({...touchTgt1, "identifier": touchTgt1.identifier + 1}, evt, []);

        expect(data.scalingRatio(1)).toBe(0);
    });

    test("project", () => {
        expect(ScaleTouchDataImpl.project([2, 3], [1, -2])).toBeCloseTo(-0.8);
    });

    test("distance", () => {
        expect(ScaleTouchDataImpl.distance([20, 22], [5, 6])).toBeCloseTo(21.93);
    });
});
