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

import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {InputState} from "../../src/api/fsm/InputState";
import {OutputStateBase} from "../../src/impl/fsm/OutputStateBase";
import {StubTransitionOK} from "./StubTransitionOK";
import {StdState} from "../../src/impl/fsm/StdState";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import type {Transition} from "../../src/api/fsm/Transition";

let state: OutputStateBase;
let fsm: FSMImpl & MockProxy<FSMImpl>;

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
    expect(state.transitions).toHaveLength(1);
});

test("addTransition OK", () => {
    const t1 = mock<Transition<Event>>();
    const t2 = mock<Transition<Event>>();
    state.addTransition(t2);
    state.addTransition(t1);
    expect(state.transitions).toStrictEqual([t2, t1]);
});

test("uninstall", () => {
    const t1 = mock<Transition<Event>>();
    const t2 = mock<Transition<Event>>();
    state.addTransition(t1);
    state.addTransition(t2);
    state.uninstall();
    expect(t1.uninstall).toHaveBeenCalledTimes(1);
    expect(t2.uninstall).toHaveBeenCalledTimes(1);
    expect(state.transitions).toHaveLength(0);
});
