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

import type {FSMDataHandler, Logger, StateBase} from "../../src/interacto";
import {FSMImpl, StdState} from "../../src/interacto";
import {mock} from "jest-mock-extended";

describe("using a state impl", () => {
    let state: StateBase;
    let fsm: FSMImpl<FSMDataHandler>;

    beforeEach(() => {
        fsm = new FSMImpl(mock<Logger>());
        state = new StdState(fsm, "s1");
    });

    test("fSM", () => {
        expect(state.fsm).toStrictEqual(fsm);
    });

    test("name", () => {
        expect(state.name).toBe("s1");
    });
});
