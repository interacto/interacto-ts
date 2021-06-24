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

import {PointsDataImpl} from "../../src/impl/interaction/PointsDataImpl";
import {PointDataImpl} from "../../src/impl/interaction/PointDataImpl";

let data: PointsDataImpl;
let pointData: PointDataImpl;

beforeEach(() => {
    data = new PointsDataImpl();
    pointData = new PointDataImpl();
    pointData.copy({
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
});

test("pointsData is empty by default", () => {
    expect(data.points).toHaveLength(0);
});

test("addPoint", () => {
    data.addPoint(pointData);
    expect(data.points).toHaveLength(1);
    const element = data.points[0];
    expect(element).toStrictEqual(pointData);
});

test("flush", () => {
    data.addPoint(pointData);
    data.flush();
    expect(data.points).toHaveLength(0);
    expect(data.currentPosition).toBeUndefined();
});

test("lastButton is defined when there are points", () => {
    data.addPoint(pointData);
    expect(data.lastButton).toBe(1);
});

test("lastButton is undefined when there are no points", () => {
    expect(data.lastButton).toBeUndefined();
});

test("currentPosition", () => {
    expect(data.currentPosition).toBeUndefined();
});
