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

describe("using a multi touch data", () => {
    let data: MultiTouchDataImpl;
    let touchData1: SrcTgtTouchDataImpl;
    let touchData2: SrcTgtTouchDataImpl;
    let touchSrc1: Touch;
    let touchSrc2: Touch;
    let touchTgt1: Touch;
    let touchTgt2: Touch;
    let evt: EventModifierData & UnitInteractionData;

    beforeEach(() => {
        data = new MultiTouchDataImpl();

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
            "identifier": 20,
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

        touchData1 = new SrcTgtTouchDataImpl();
        touchData1.copySrc(touchSrc1, evt, []);
        touchData1.copyTgt(touchTgt1, evt, []);

        touchData2 = new SrcTgtTouchDataImpl();
        touchData2.copySrc(touchSrc2, evt, []);
        touchData2.copyTgt(touchTgt2, evt, []);
    });

    test("touches collection is empty by default", () => {
        expect(data.touches).toHaveLength(0);
    });

    test("addTouchData", () => {
        data.addTouchData(touchData1);
        expect(data.touches).toHaveLength(1);
        const element = data.touches[0];
        expect(element).toStrictEqual(touchData1);
    });

    test("removeTouchData touch point exists", () => {
        data.addTouchData(touchData1);
        data.removeTouchData(20);
        expect(data.touches).toHaveLength(0);
        expect(touchData1).toStrictEqual(new SrcTgtTouchDataImpl());
    });

    test("removeTouchData touch point doesn't exist", () => {
        data.addTouchData(touchData1);
        data.removeTouchData(6000);
        expect(data.touches).toHaveLength(1);
    });

    test("flush", () => {
        data.addTouchData(touchData1);
        data.flush();
        expect(data.touches).toHaveLength(0);
        expect(touchData1).toStrictEqual(new SrcTgtTouchDataImpl());
    });

    test("setTouch touch point exists", () => {
        data.addTouchData(touchData1);
        const newTouch: Touch = {
            "force": 15,
            "identifier": 20,
            "radiusX": 25,
            "radiusY": 30,
            "rotationAngle": 35,
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
        newTouchData.copySrc(touchSrc1, evt, []);
        newTouchData.copyTgt(newTouch, newEvt, []);
        data.setTouch(newTouch, newEvt);

        expect(data.touches[0]).toStrictEqual(newTouchData);
    });

    test("setTouch touch point doesn't exist", () => {
        data.addTouchData(touchData1);
        const newTouch: Touch = {
            "force": 15,
            "identifier": 6000,
            "radiusX": 25,
            "radiusY": 30,
            "rotationAngle": 35,
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

        expect(data.touches[0]).toStrictEqual(touchData1);
    });

    test("isHorizontal OK", () => {
        data.addTouchData(touchData1);

        expect(data.isHorizontal(10)).toBeTruthy();
    });

    test("isHorizontal KO", () => {
        data.addTouchData(touchData1);

        expect(data.isHorizontal(1)).toBeFalsy();
    });

    test("isHorizontal wrong direction KO", () => {
        data.addTouchData(touchData1);
        data.addTouchData(touchData2);

        expect(data.isHorizontal(10)).toBeFalsy();
    });

    test("isVertical OK", () => {
        data.addTouchData(touchData1);

        expect(data.isVertical(10)).toBeTruthy();
    });

    test("isVertical KO", () => {
        data.addTouchData(touchData1);

        expect(data.isVertical(1)).toBeFalsy();
    });

    test("isVertical wrong direction KO", () => {
        data.addTouchData(touchData1);
        data.addTouchData(touchData2);

        expect(data.isVertical(1)).toBeFalsy();
    });

    test("pinchFactor OK", () => {
        data.addTouchData(touchData1);
        data.addTouchData(touchData2);

        expect(data.pinchFactor(0.72)).toBeCloseTo(3.1018);
    });

    test("pinchFactor undefined invalid number of touches", () => {
        data.addTouchData(touchData1);

        expect(data.pinchFactor(1)).toBeUndefined();
    });

    test("pinchFactor undefined same direction", () => {
        data.addTouchData(touchData1);
        data.addTouchData(touchData1);

        expect(data.pinchFactor(1)).toBeUndefined();
    });

    test("pinchFactor undefined low tolerance", () => {
        data.addTouchData(touchData1);
        data.addTouchData(touchData1);

        // (actual distance between tgt1 and the projected point: about 0.71px)
        expect(data.pinchFactor(0.7)).toBeUndefined();
    });

    test("project", () => {
        expect(MultiTouchDataImpl.project([2, 3], [1, -2])).toBeCloseTo(-0.8);
    });

    test("distance", () => {
        expect(MultiTouchDataImpl.distance([20, 22], [5, 6])).toBeCloseTo(21.93);
    });
});
