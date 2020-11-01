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

import {EventRegistrationToken} from "../../src/impl/fsm/Events";
import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {ReleaseTransition} from "../../src/impl/fsm/ReleaseTransition";
import {StdState} from "../../src/impl/fsm/StdState";
import {createMouseEvent, createTouchEvent} from "../interaction/StubEvents";
import {mock} from "jest-mock-extended";

let tr: ReleaseTransition;
let canvas: HTMLCanvasElement;

beforeEach(() => {
    tr = new ReleaseTransition(new StdState(mock<FSMImpl>(), "a"), new StdState(mock<FSMImpl>(), "b"));
    canvas = document.createElement("canvas");
});

test("invalid move event", () => {
    expect(tr.accept(createMouseEvent(EventRegistrationToken.mouseMove, canvas,
        11, 23, 11, 23, 0))).toBeFalsy();
});

test("invalid event type", () => {
    expect(tr.accept(createTouchEvent(EventRegistrationToken.touchstart, 3,
        canvas, 11, 23, 12, 25))).toBeFalsy();
});

test("valid event", () => {
    expect(tr.accept(createMouseEvent(EventRegistrationToken.mouseUp,
        canvas, 11, 23, 12, 25, 1))).toBeTruthy();
});

test("guard OK", () => {
    expect(tr.isGuardOK(createMouseEvent(EventRegistrationToken.mouseUp,
        canvas, 11, 23, 12, 25, 1))).toBeTruthy();
});

test("accepted events", () => {
    expect(tr.getAcceptedEvents()).toStrictEqual(new Set([EventRegistrationToken.mouseUp]));
});
