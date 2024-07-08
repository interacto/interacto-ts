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

import {CancellingState} from "../../src/impl/fsm/CancellingState";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {OutputState} from "../../src/api/fsm/OutputState";
import type {VisitorFSM} from "../../src/api/fsm/VisitorFSM";
import type {FSMDataHandler} from "../../src/impl/fsm/FSMDataHandler";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {MockProxy} from "jest-mock-extended";

describe("using a cancelling state", () => {
    let state: CancellingState;
    let fsm: FSMImpl<FSMDataHandler> & MockProxy<FSMImpl<FSMDataHandler>>;

    beforeEach(() => {
        fsm = mock<FSMImpl<FSMDataHandler>>();
        state = new CancellingState(fsm, "os");
    });

    test("enter", () => {
        state.enter();
        expect(fsm.onCancelling).toHaveBeenCalledTimes(1);
    });

    test("checkStartingState fsm started", () => {
        Object.defineProperty(fsm, "started", {
            "get": jest.fn(() => true)
        });

        state.checkStartingState();
        expect(fsm.onStarting).not.toHaveBeenCalledWith();
    });

    test("checkStartingState fsm not started but starting state not this state", () => {
        Object.defineProperty(fsm, "started", {
            "get": jest.fn(() => false)
        });
        Object.defineProperty(fsm, "startingState", {
            "get": jest.fn(() => mock<OutputState>())
        });

        state.checkStartingState();
        expect(fsm.onStarting).not.toHaveBeenCalledWith();
    });

    test("checkStartingState fsm not started and starting state is this state", () => {
        Object.defineProperty(fsm, "started", {
            "get": jest.fn(() => false)
        });
        Object.defineProperty(fsm, "startingState", {
            "get": jest.fn(() => state)
        });
        state.checkStartingState();
        expect(fsm.onStarting).toHaveBeenCalledTimes(1);
    });

    test("visitor works", () => {
        const visitor = mock<VisitorFSM>();
        state.acceptVisitor(visitor);
        expect(visitor.visitCancellingState).toHaveBeenCalledWith(state);
    });
});
