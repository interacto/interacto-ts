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

import {isEltRef} from "../../src/api/binder/BaseBinderBuilder";
import { describe, expect, test } from "@jest/globals";

describe("using a base binder builder", () => {
    test("undefined is not eltref", () => {
        expect(isEltRef(undefined)).toBeFalsy();
    });

    test("null is not eltref", () => {
        expect(isEltRef(null)).toBeFalsy();
    });

    test("number is not eltref", () => {
        expect(isEltRef(1)).toBeFalsy();
    });

    test("string is not eltref", () => {
        expect(isEltRef("foooo")).toBeFalsy();
    });

    test("{} is not eltref", () => {
        expect(isEltRef({})).toBeFalsy();
    });

    test("o.nativeElement is not EventTarget", () => {
        expect(isEltRef({
            "nativeElement": 2
        })).toBeFalsy();
    });

    test("o.nativeElement is EventTarget", () => {
        const elt = document.createElement("button");
        expect(isEltRef({
            "nativeElement": elt
        })).toBeTruthy();
    });
});
