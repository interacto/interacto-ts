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

// This files contains helper routines for testing the library.

import {expect, jest} from "@jest/globals";
import type {TouchData} from "../src/api/interaction/TouchData";

/**
 * Flushes the ongoing promises
 * @returns The promise to flush.
 */
export async function flushPromises(): Promise<unknown> {
    jest.useRealTimers();
    return new Promise(resolve => {
        setTimeout(resolve);
    });
}

export function checkTouchPoint(data: TouchData, lx: number, ly: number, sx: number, sy: number, id: number, o: EventTarget): void {
    expect(data.clientX).toStrictEqual(lx);
    expect(data.clientY).toStrictEqual(ly);
    expect(data.screenX).toStrictEqual(sx);
    expect(data.screenY).toStrictEqual(sy);
    expect(data.identifier).toStrictEqual(id);
    expect(data.target).toBe(o);
}
