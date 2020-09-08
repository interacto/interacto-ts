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

import {FSM} from "../../src/fsm/FSM";
import {InputState} from "../../src/fsm/InputState";
import {OutputStateImpl} from "../../src/fsm/OutputStateImpl";
import {StubTransitionOK} from "./StubTransitionOK";
import {StdState} from "../../src/fsm/StdState";
import {Transition} from "../../src/fsm/Transition";

let state: OutputStateImpl;
let fsm: FSM;

beforeEach(() => {
    fsm = {} as FSM;
    state = new class extends OutputStateImpl {
        public constructor() {
            super(fsm, "os");
        }

        public exit(): void {
        }
    }();
});

test("getTransitions", () => {
    state.addTransition(new StubTransitionOK(new StdState(fsm, "s"), {} as InputState));
    const tr = state.getTransitions();
    tr.length = 0;
    expect(state.getTransitions()).toHaveLength(1);
});

test("addTransition OK", () => {
    const t1 = {} as Transition;
    const t2 = {} as Transition;
    state.addTransition(t2);
    state.addTransition(t1);
    expect(state.getTransitions()).toStrictEqual([t2, t1]);
});

test("uninstall", () => {
    const t1 = {} as Transition;
    const t2 = {} as Transition;
    t1.uninstall = jest.fn();
    t2.uninstall = jest.fn();
    state.addTransition(t1);
    state.addTransition(t2);
    state.uninstall();
    expect(t1.uninstall).toHaveBeenCalledTimes(1);
    expect(t2.uninstall).toHaveBeenCalledTimes(1);
    expect(state.getTransitions()).toHaveLength(0);
});
