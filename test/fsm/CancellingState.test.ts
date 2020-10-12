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
import {mock, MockProxy} from "jest-mock-extended";

let state: CancellingState;
let fsm: MockProxy<FSM> & FSM;

beforeEach(() => {
    fsm = mock<FSM>();
    state = new CancellingState(fsm, "os");
});

test("enter", () => {
    state.enter();
    expect(fsm.onCancelling).toHaveBeenCalledTimes(1);
});

test("checkStartingState fsm started", () => {
    fsm.isStarted.mockReturnValue(true);

    state.checkStartingState();
    expect(fsm.onStarting).not.toHaveBeenCalledWith();
});

test("checkStartingState fsm not started but starting state not this state", () => {
    fsm.isStarted.mockReturnValue(false);
    fsm.getStartingState.mockReturnValue(mock<OutputState>());
    // fsm.getStartingState = jest.fn(() => ({} as OutputState));

    state.checkStartingState();
    expect(fsm.onStarting).not.toHaveBeenCalledWith();
});

test("checkStartingState fsm not started and starting state is this state", () => {
    fsm.isStarted.mockReturnValue(false);
    fsm.getStartingState.mockReturnValue(state);

    state.checkStartingState();
    expect(fsm.onStarting).toHaveBeenCalledTimes(1);
});
