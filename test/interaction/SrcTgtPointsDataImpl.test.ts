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

import {SrcTgtPointsDataImpl} from "../../src/impl/interaction/SrcTgtPointsDataImpl";
import {PointDataImpl} from "../../src/impl/interaction/PointDataImpl";

describe("using a scrtgtpoints data", () => {
    let data: SrcTgtPointsDataImpl;
    let pointSrc: PointDataImpl;
    let pointTgt: PointDataImpl;

    beforeEach(() => {
        data = new SrcTgtPointsDataImpl();
        pointSrc = new PointDataImpl();
        pointSrc.copy({
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
            "timeStamp": 10,
            "target": new EventTarget(),
            "currentTarget": new EventTarget()
        });

        pointTgt = new PointDataImpl();
        pointTgt.copy({
            "button": 1,
            "buttons": 2,
            "movementX": 20,
            "movementY": 40,
            "offsetX": 10,
            "offsetY": 30,
            "relatedTarget": new EventTarget(),
            "clientX": 12,
            "clientY": 14,
            "pageX": 16,
            "pageY": 18,
            "screenX": 18,
            "screenY": 20,
            "altKey": true,
            "ctrlKey": true,
            "metaKey": true,
            "shiftKey": true,
            "timeStamp": 20,
            "target": new EventTarget(),
            "currentTarget": new EventTarget()
        });

        data.copySrc(pointSrc);
        data.copyTgt(pointTgt);
    });

    test("flush", () => {
        data.flush();
        expect(data.src).toStrictEqual(new PointDataImpl());
        expect(data.tgt).toStrictEqual(new PointDataImpl());
    });

    test("diffClientX", () => {
        expect(data.diffClientX).toBe(1);
    });

    test("diffClientY", () => {
        expect(data.diffClientY).toBe(2);
    });

    test("diffPageX", () => {
        expect(data.diffPageX).toBe(3);
    });

    test("diffPageY", () => {
        expect(data.diffPageY).toBe(4);
    });

    test("diffScreenX", () => {
        expect(data.diffScreenX).toBe(3);
    });

    test("diffScreenY", () => {
        expect(data.diffScreenY).toBe(4);
    });

    test("duration", () => {
        expect(data.duration).toBe(10);
    });

    test("velocity", () => {
        // velocity should be sqrt(deltaX^2 + deltaY^2) / velocity = sqrt(16 + 9) / 10 = 0.5
        expect(data.velocity).toBe(0.5);
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
});
