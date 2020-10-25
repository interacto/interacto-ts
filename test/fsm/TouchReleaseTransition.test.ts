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

import {TouchReleaseTransition} from "../../src/fsm/TouchReleaseTransition";
import {createMouseEvent, createTouchEvent} from "../interaction/StubEvents";
import {EventRegistrationToken} from "../../src/fsm/Events";
import {FSMImpl} from "../../src/fsm/FSMImpl";
import {StdState} from "../../src/fsm/StdState";
import {mock} from "jest-mock-extended";

let tr: TouchReleaseTransition;

beforeEach(() => {
    tr = new TouchReleaseTransition(new StdState(mock<FSMImpl>(), "a"), new StdState(mock<FSMImpl>(), "b"));
    document.documentElement.innerHTML = "<html><div><canvas id='canvas' /></div></html>";
});

test("invalid event", () => {
    expect(tr.accept(createMouseEvent(EventRegistrationToken.mouseUp, document.getElementById("canvas") as EventTarget,
        11, 23, 11, 23, 0))).toBeFalsy();
});

test("valid event", () => {
    expect(tr.accept(createTouchEvent(EventRegistrationToken.touchend, 3,
        document.getElementById("canvas") as EventTarget, 11, 23, 12, 25))).toBeTruthy();
});

test("guard OK", () => {
    expect(tr.isGuardOK(createTouchEvent(EventRegistrationToken.touchend, 3,
        document.getElementById("canvas") as EventTarget, 11, 23, 12, 25))).toBeTruthy();
});

test("accepted events", () => {
    expect(tr.getAcceptedEvents()).toStrictEqual(new Set([EventRegistrationToken.touchend]));
});
