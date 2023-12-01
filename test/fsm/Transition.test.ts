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

import {StubTransitionOK} from "./StubTransitionOk";
import {StdState} from "../../src/impl/fsm/StdState";
import {mock} from "jest-mock-extended";
import type {VisitorFSM} from "../../src/api/fsm/VisitorFSM";
import type {FSMDataHandler} from "../../src/impl/fsm/FSMDataHandler";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {TransitionBase} from "../../src/impl/fsm/TransitionBase";

describe("using a transition", () => {
    let tr: TransitionBase<Event>;
    let state1: StdState;
    let state2: StdState;

    beforeEach(() => {
        const fsm: FSMImpl<FSMDataHandler> = mock<FSMImpl<FSMDataHandler>>();
        state1 = new StdState(fsm, "s1");
        state2 = new StdState(fsm, "s2");
        tr = new StubTransitionOK(state1, state2);
    });

    test("good src", () => {
        expect(tr.src).toStrictEqual(state1);
    });

    test("good tgt", () => {
        expect(tr.tgt).toStrictEqual(state2);
    });

    test("src state transition added", () => {
        expect(state1.transitions).toHaveLength(1);
        expect(state1.transitions[0]).toStrictEqual(tr);
    });

    test("visitor works", () => {
        const visitor = mock<VisitorFSM>();
        tr.acceptVisitor(visitor);
        expect(visitor.visitTransition).toHaveBeenCalledWith(tr);
    });
});
