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
        "timeStamp": 17,
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
        "screenX": 20,
        "screenY": 22,
        "altKey": true,
        "ctrlKey": true,
        "metaKey": true,
        "shiftKey": true,
        "timeStamp": 17,
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
    expect(data.diffScreenX).toStrictEqual(5);
});

test("diffScreenY", () => {
    expect(data.diffScreenY).toStrictEqual(6);
});
