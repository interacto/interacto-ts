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

import {MouseTransition} from "../../src/impl/fsm/MouseTransition";
import {StdState} from "../../src/impl/fsm/StdState";
import {createMouseEvent, createTouchEvent} from "../interaction/StubEvents";
import {mock} from "jest-mock-extended";
import type {FSMDataHandler} from "../../src/impl/fsm/FSMDataHandler";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";

describe("using a mouse up transition", () => {
    let tr: MouseTransition;
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        tr = new MouseTransition(new StdState(mock<FSMImpl<FSMDataHandler>>(), "a"),
            new StdState(mock<FSMImpl<FSMDataHandler>>(), "b"), "mouseup");
        canvas = document.createElement("canvas");
    });

    test("invalid move event", () => {
        expect(tr.accept(createMouseEvent("mousemove", canvas, 11, 23, 11, 23, 0))).toBeFalsy();
    });

    test("invalid event type", () => {
        expect(tr.accept(createTouchEvent("touchstart", 3, canvas, 11, 23, 12, 25))).toBeFalsy();
    });

    test("valid event", () => {
        expect(tr.accept(createMouseEvent("mouseup", canvas, 11, 23, 12, 25, 1))).toBeTruthy();
    });

    test("guard OK", () => {
        expect(tr.guard(createMouseEvent("mouseup", canvas, 11, 23, 12, 25, 1))).toBeTruthy();
    });

    test("accepted events", () => {
        expect(tr.getAcceptedEvents()).toStrictEqual(new Set(["mouseup"]));
    });
});
