/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */

import {FocusHTMLElement} from "../../../src/interacto";
import {describe, expect, test, vi} from "vitest";

describe("using a focus html element command", () => {
    test("canExecute returns false when the element is not an HTMLElement", () => {
        const cmd = new FocusHTMLElement({});

        const canExecute = cmd.canExecute();

        expect(canExecute).toBeFalsy();
    });

    test("execute does not focus and returns false when the element is not an HTMLElement", () => {
        const target = {focus: vi.fn()};
        const cmd = new FocusHTMLElement(target);

        const res = cmd.execute();

        expect(res).toBeFalsy();
        expect(target.focus).not.toHaveBeenCalled();
    });

    test("canExecute returns true when the element is an HTMLElement", () => {
        const element = document.createElement("div");
        const cmd = new FocusHTMLElement(element);

        const canExecute = cmd.canExecute();

        expect(canExecute).toBeTruthy();
    });

    test("execute focuses the HTMLElement", async () => {
        const element = document.createElement("div");
        const focusSpy = vi.spyOn(element, "focus");
        const cmd = new FocusHTMLElement(element);

        const res = await cmd.execute();

        expect(res).toBeTruthy();
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });
});
