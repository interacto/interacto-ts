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

import {CancellingState} from "../../src/fsm/CancellingState";
import {FSM} from "../../src/fsm/FSM";
import {OutputState} from "../../src/fsm/OutputState";

let state: CancellingState;
let fsm: FSM;

beforeEach(() => {
    fsm = {} as FSM;
    state = new CancellingState(fsm, "os");
});

test("enter", () => {
    fsm.onCancelling = jest.fn();
    jest.spyOn(fsm, "onCancelling");
    state.enter();
    expect(fsm.onCancelling).toHaveBeenCalledTimes(1);
});

test("checkStartingState fsm started", () => {
    fsm.onStarting = jest.fn();
    fsm.isStarted = jest.fn(() => true);
    jest.spyOn(fsm, "onStarting");

    state.checkStartingState();
    expect(fsm.onStarting).not.toHaveBeenCalledWith();
});

test("checkStartingState fsm not started but starting state not this state", () => {
    fsm.onStarting = jest.fn();
    fsm.isStarted = jest.fn(() => false);
    fsm.getStartingState = jest.fn(() => ({} as OutputState));
    jest.spyOn(fsm, "onStarting");

    state.checkStartingState();
    expect(fsm.onStarting).not.toHaveBeenCalledWith();
});

test("checkStartingState fsm not started and starting state is this state", () => {
    fsm.onStarting = jest.fn();
    fsm.isStarted = jest.fn(() => false);
    fsm.getStartingState = jest.fn(() => state);
    jest.spyOn(fsm, "onStarting");

    state.checkStartingState();
    expect(fsm.onStarting).toHaveBeenCalledTimes(1);
});
