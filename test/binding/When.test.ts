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

import {isWhenAtEnd, isWhenAtStart, isWhenAtThen, isWhenStrict} from "../../src/api/binder/When";

describe("test WhenType", () => {
    test("isWhenAtStart", () => {
        expect(isWhenAtStart("nonStrict")).toBeTruthy();
        expect(isWhenAtStart("strict")).toBeTruthy();
        expect(isWhenAtStart("strictStart")).toBeTruthy();
        expect(isWhenAtStart("then")).toBeTruthy();
        expect(isWhenAtStart("strictThen")).toBeFalsy();
        expect(isWhenAtStart("end")).toBeFalsy();
    });

    test("isWhenAtEnd", () => {
        expect(isWhenAtEnd("nonStrict")).toBeTruthy();
        expect(isWhenAtEnd("strict")).toBeTruthy();
        expect(isWhenAtEnd("end")).toBeTruthy();
        expect(isWhenAtEnd("strictStart")).toBeFalsy();
        expect(isWhenAtEnd("then")).toBeFalsy();
        expect(isWhenAtEnd("strictThen")).toBeFalsy();
    });

    test("isWhenAtThen", () => {
        expect(isWhenAtThen("nonStrict")).toBeTruthy();
        expect(isWhenAtThen("strict")).toBeTruthy();
        expect(isWhenAtThen("then")).toBeTruthy();
        expect(isWhenAtThen("strictThen")).toBeTruthy();
        expect(isWhenAtThen("end")).toBeFalsy();
        expect(isWhenAtThen("strictStart")).toBeFalsy();
    });

    test("isWhenStrict", () => {
        expect(isWhenStrict("strictStart")).toBeTruthy();
        expect(isWhenStrict("strict")).toBeTruthy();
        expect(isWhenStrict("strictThen")).toBeTruthy();
        expect(isWhenStrict("end")).toBeTruthy();
        expect(isWhenStrict("then")).toBeFalsy();
        expect(isWhenStrict("nonStrict")).toBeFalsy();
    });
});
