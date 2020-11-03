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

import {OutputState} from "../../src/api/fsm/OutputState";
import {mock, MockProxy} from "jest-mock-extended";
import {InputState} from "../../src/api/fsm/InputState";
import {createEventWithTarget} from "../interaction/StubEvents";
import {DatePickedTransition} from "../../src/impl/fsm/DatePickedTransition";

let tr: DatePickedTransition;
let src: OutputState & MockProxy<OutputState>;
let tgt: InputState & MockProxy<InputState>;
let evt: Event;

beforeEach(() => {
    src = mock<OutputState>();
    tgt = mock<InputState>();
    evt = mock<Event>();
    tr = new DatePickedTransition(src, tgt);
});

test("that getAcceptedEvents works", () => {
    expect(tr.getAcceptedEvents()).toStrictEqual(["input"]);
});

test("that accept KO null target", () => {
    expect(tr.accept(evt)).toBeFalsy();
});

test("that accept KO target not button", () => {
    expect(tr.accept(createEventWithTarget(mock<HTMLSelectElement>(), "input"))).toBeFalsy();
});

test("that accept OK", () => {
    const target = document.createElement("input");
    target.type = "date";
    expect(tr.accept(createEventWithTarget(target, "input"))).toBeTruthy();
});

