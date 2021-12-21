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

import {isWhenAtEnd, isWhenAtStart, isWhenAtThen, isWhenStrict, WhenType} from "../../src/api/binder/When";

describe("test WhenType", () => {
    test("isWhenAtStart", () => {
        expect(isWhenAtStart(WhenType.nonStrict)).toBeTruthy();
        expect(isWhenAtStart(WhenType.strict)).toBeTruthy();
        expect(isWhenAtStart(WhenType.strictStart)).toBeTruthy();
        expect(isWhenAtStart(WhenType.then)).toBeTruthy();
        expect(isWhenAtStart(WhenType.strictThen)).toBeFalsy();
        expect(isWhenAtStart(WhenType.end)).toBeFalsy();
    });

    test("isWhenAtEnd", () => {
        expect(isWhenAtEnd(WhenType.nonStrict)).toBeTruthy();
        expect(isWhenAtEnd(WhenType.strict)).toBeTruthy();
        expect(isWhenAtEnd(WhenType.end)).toBeTruthy();
        expect(isWhenAtEnd(WhenType.strictStart)).toBeFalsy();
        expect(isWhenAtEnd(WhenType.then)).toBeFalsy();
        expect(isWhenAtEnd(WhenType.strictThen)).toBeFalsy();
    });

    test("isWhenAtThen", () => {
        expect(isWhenAtThen(WhenType.nonStrict)).toBeTruthy();
        expect(isWhenAtThen(WhenType.strict)).toBeTruthy();
        expect(isWhenAtThen(WhenType.then)).toBeTruthy();
        expect(isWhenAtThen(WhenType.strictThen)).toBeTruthy();
        expect(isWhenAtThen(WhenType.end)).toBeFalsy();
        expect(isWhenAtThen(WhenType.strictStart)).toBeFalsy();
    });

    test("isWhenStrict", () => {
        expect(isWhenStrict(WhenType.strictStart)).toBeTruthy();
        expect(isWhenStrict(WhenType.strict)).toBeTruthy();
        expect(isWhenStrict(WhenType.strictThen)).toBeTruthy();
        expect(isWhenStrict(WhenType.end)).toBeTruthy();
        expect(isWhenStrict(WhenType.then)).toBeFalsy();
        expect(isWhenStrict(WhenType.nonStrict)).toBeFalsy();
    });
});
