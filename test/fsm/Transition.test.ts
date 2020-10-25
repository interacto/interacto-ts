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

import {StdState} from "../../src/fsm/StdState";
import {Transition} from "../../src/fsm/Transition";
import {FSMImpl} from "../../src/fsm/FSMImpl";
import {StubTransitionOK} from "./StubTransitionOK";
import {ErrorCatcher} from "../../src/error/ErrorCatcher";
import {mock} from "jest-mock-extended";

let tr: Transition;
let state1: StdState;
let state2: StdState;


beforeEach(() => {
    const fsm: FSMImpl = mock<FSMImpl>();
    state1 = new StdState(fsm, "s1");
    state2 = new StdState(fsm, "s2");
    tr = new StubTransitionOK(state1, state2);
});

test("testGoodSrc", () => {
    expect(tr.src).toStrictEqual(state1);
});

test("testGoodTgt", () => {
    expect(tr.tgt).toStrictEqual(state2);
});

test("testSrcStateTransitionAdded", () => {
    expect(state1.getTransitions()).toHaveLength(1);
    expect(state1.getTransitions()[0]).toStrictEqual(tr);
});

test("uninstall", () => {
    const errors: Array<Error> = [];
    const disposable = ErrorCatcher.getInstance().getErrors()
        .subscribe(err => errors.push(err));
    tr.uninstall();
    disposable.unsubscribe();
    expect(errors).toHaveLength(0);
});
