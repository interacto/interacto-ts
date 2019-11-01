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

import { FSM } from "../../src/fsm/FSM";
import { InitState } from "../../src/fsm/InitState";
import "jest";
import { StdState } from "../../src/fsm/StdState";

let fsm: FSM;

beforeEach(() => {
    fsm = new FSM();
});

test("testInitState", () => {
    expect(fsm.getStates().length).toBe(1);
    expect(fsm.getStates()[0]).toBeInstanceOf(InitState);
});

test("testInner", () => {
    expect(fsm.inner).toBeFalsy();
});

test("testStartingState", () => {
    expect(fsm.startingState).toEqual(fsm.initState);
});

test("testCurrentStateAtStart", () => {
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testAddState", () => {
    const state: StdState = new StdState(fsm, "s1");
    fsm.addState(state);
    expect(fsm.getStates().length).toBe(2);
});
