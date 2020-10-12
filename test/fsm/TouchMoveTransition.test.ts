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

import {TouchMoveTransition} from "../../src/fsm/TouchMoveTransition";
import {createMouseEvent, createTouchEvent} from "../interaction/StubEvents";
import {EventRegistrationToken} from "../../src/fsm/Events";
import {FSM} from "../../src/fsm/FSM";
import {StdState} from "../../src/fsm/StdState";
import {mock} from "jest-mock-extended";

let tr: TouchMoveTransition;

beforeEach(() => {
    tr = new TouchMoveTransition(new StdState(mock<FSM>(), "a"), new StdState(mock<FSM>(), "b"));
    document.documentElement.innerHTML = "<html><div><canvas id='canvas' /></div></html>";
});

test("invalid event", () => {
    expect(tr.accept(createMouseEvent(EventRegistrationToken.mouseDown, document.getElementById("canvas") as EventTarget,
        11, 23, 11, 23, 0))).toBeFalsy();
});

test("valid event", () => {
    expect(tr.accept(createTouchEvent(EventRegistrationToken.touchmove, 3,
        document.getElementById("canvas") as EventTarget, 11, 23, 12, 25))).toBeTruthy();
});

test("guard OK", () => {
    expect(tr.isGuardOK(createTouchEvent(EventRegistrationToken.touchmove, 3,
        document.getElementById("canvas") as EventTarget, 11, 23, 12, 25))).toBeTruthy();
});

test("accepted events", () => {
    expect(tr.getAcceptedEvents()).toStrictEqual(new Set([EventRegistrationToken.touchmove]));
});
