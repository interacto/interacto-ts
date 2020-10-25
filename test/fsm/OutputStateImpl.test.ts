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

import {FSMImpl} from "../../src/fsm/FSMImpl";
import {InputState} from "../../src/fsm/InputState";
import {OutputStateBase} from "../../src/fsm/OutputStateBase";
import {StubTransitionOK} from "./StubTransitionOK";
import {StdState} from "../../src/fsm/StdState";
import {Transition} from "../../src/fsm/Transition";
import {mock, MockProxy} from "jest-mock-extended";

let state: OutputStateBase;
let fsm: MockProxy<FSMImpl> & FSMImpl;

beforeEach(() => {
    fsm = mock<FSMImpl>();
    state = new class extends OutputStateBase {
        public constructor() {
            super(fsm, "os");
        }

        public exit(): void {
        }
    }();
});

test("getTransitions", () => {
    state.addTransition(new StubTransitionOK(new StdState(fsm, "s"), mock<InputState>()));
    const tr = state.getTransitions();
    tr.length = 0;
    expect(state.getTransitions()).toHaveLength(1);
});

test("addTransition OK", () => {
    const t1 = mock<Transition>();
    const t2 = mock<Transition>();
    state.addTransition(t2);
    state.addTransition(t1);
    expect(state.getTransitions()).toStrictEqual([t2, t1]);
});

test("uninstall", () => {
    const t1 = mock<Transition>();
    const t2 = mock<Transition>();
    state.addTransition(t1);
    state.addTransition(t2);
    state.uninstall();
    expect(t1.uninstall).toHaveBeenCalledTimes(1);
    expect(t2.uninstall).toHaveBeenCalledTimes(1);
    expect(state.getTransitions()).toHaveLength(0);
});
