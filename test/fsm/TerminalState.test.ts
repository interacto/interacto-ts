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

import {TerminalState} from "../../src/impl/fsm/TerminalState";
import {beforeEach, describe, expect, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {VisitorFSM} from "../../src/api/fsm/VisitorFSM";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {MockProxy} from "jest-mock-extended";

describe("using a terminal state", () => {
    let state: TerminalState;
    let fsm: FSMImpl & MockProxy<FSMImpl>;

    beforeEach(() => {
        fsm = mock<FSMImpl>();
        state = new TerminalState(fsm, "os");
    });

    test("enter", () => {
        state.enter();
        expect(fsm.onTerminating).toHaveBeenCalledTimes(1);
    });

    test("visitor works", () => {
        const visitor = mock<VisitorFSM>();
        state.acceptVisitor(visitor);
        expect(visitor.visitTerminalState).toHaveBeenCalledWith(state);
    });
});
