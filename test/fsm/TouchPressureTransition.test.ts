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

import {createMouseEvent, createTouchEvent} from "../interaction/StubEvents";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {StdState} from "../../src/impl/fsm/StdState";
import {mock} from "jest-mock-extended";
import type {FSMDataHandler} from "../../src/impl/fsm/FSMDataHandler";
import {TouchTransition} from "../../src/impl/fsm/TouchTransition";

let tr: TouchTransition;
let canvas: HTMLCanvasElement;

beforeEach(() => {
    tr = new TouchTransition(new StdState(mock<FSMImpl<FSMDataHandler>>(), "a"),
        new StdState(mock<FSMImpl<FSMDataHandler>>(), "b"), "touchstart");
    canvas = document.createElement("canvas");
});

test("invalid event", () => {
    expect(tr.accept(createMouseEvent("mousedown", canvas,
        11, 23, 11, 23, 0))).toBeFalsy();
});

test("valid event", () => {
    expect(tr.accept(createTouchEvent("touchstart", 3,
        canvas, 11, 23, 12, 25))).toBeTruthy();
});

test("guard OK", () => {
    expect(tr.guard(createTouchEvent("touchstart", 3,
        canvas, 11, 23, 12, 25))).toBeTruthy();
});

test("accepted events", () => {
    expect(tr.getAcceptedEvents()).toStrictEqual(["touchstart"]);
});
