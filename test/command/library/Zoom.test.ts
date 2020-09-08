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

import {Zoom} from "../../../src/command/library/Zoom";
import {Zoomable} from "../../../src/properties/Zoomable";

jest.mock("../../../src/properties/Zoomable");

let cmd: Zoom;
let zoomable: Zoomable;

beforeEach(() => {
    zoomable = {} as Zoomable;
    zoomable.getMinZoom = jest.fn(() => -1);
    zoomable.getMaxZoom = jest.fn(() => 10);
    zoomable.setZoom = jest.fn();
    cmd = new Zoom(zoomable);
});

afterEach(() => {
    jest.clearAllMocks();
});

test("testCannotDoZoomLevelBad", () => {
    expect(cmd.canDo()).toBeFalsy();
});

[-1.01, 10.01].forEach(value => {
    test("testCannotDoZoomLevel", () => {
        cmd.setZoomLevel(value);
        expect(cmd.canDo()).toBeFalsy();
    });
});

[9.99, -0.99, -1, 10, 0].forEach(value => {
    test("testCanDo", () => {
        cmd.setZoomLevel(value);
        expect(cmd.canDo()).toBeTruthy();
    });
});

test("testDoWithPositions", () => {
    cmd.setZoomLevel(2);
    cmd.setPx(99);
    cmd.setPy(-12);
    cmd.doIt();
    expect(zoomable.setZoom).toHaveBeenCalledTimes(1);
    expect(zoomable.setZoom).toHaveBeenCalledWith(99, -12, 2);
});

test("testDoNoPosition", () => {
    cmd.setZoomLevel(3);
    cmd.doIt();
    expect(zoomable.setZoom).toHaveBeenCalledTimes(1);
    expect(zoomable.setZoom).toHaveBeenCalledWith(NaN, NaN, 3);
});
