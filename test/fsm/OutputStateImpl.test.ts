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
import {isOutputStateType} from "../../src/api/fsm/OutputState";
import {OutputStateBase} from "../../src/impl/fsm/OutputStateBase";
import {StdState} from "../../src/impl/fsm/StdState";
import {mock} from "jest-mock-extended";
import type {FSM} from "../../src/api/fsm/FSM";
import type {InputState} from "../../src/api/fsm/InputState";
import type {OutputState} from "../../src/api/fsm/OutputState";
import type {Transition} from "../../src/api/fsm/Transition";
import type {FSMDataHandler} from "../../src/impl/fsm/FSMDataHandler";
import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {MockProxy} from "jest-mock-extended";

describe("using an output state", () => {
    let state: OutputStateBase;
    let fsm: FSMImpl<FSMDataHandler> & MockProxy<FSMImpl<FSMDataHandler>>;

    beforeEach(() => {
        fsm = mock<FSMImpl<FSMDataHandler>>();
        state = new class extends OutputStateBase {
            public constructor() {
                super(fsm, "os");
            }

            public exit(): void {}

            public acceptVisitor(): void {}
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

    test("undefined is not undoable", () => {
        expect(isOutputStateType(undefined)).toBeFalsy();
    });

    test("object missing exit is not outputstate", () => {
        type T = Omit<OutputState, "exit">;
        const s: T = {
            "uninstall": () => {},
            "name": "foo",
            "process": () => false,
            "fsm": fsm as FSM,
            "transitions": new Array<Transition<Event>>(),
            "addTransition": () => {},
            "checkStartingState": () => false,
            "acceptVisitor": () => {}
        };
        expect(isOutputStateType(s)).toBeFalsy();
    });

    test("object missing addTransition is not outputstate", () => {
        type T = Omit<OutputState, "addTransition">;
        const s: T = {
            "uninstall": () => {},
            "name": "foo",
            "process": () => false,
            "fsm": fsm as FSM,
            "transitions": new Array<Transition<Event>>(),
            "exit": () => {},
            "checkStartingState": () => false,
            "acceptVisitor": () => {}
        };
        expect(isOutputStateType(s)).toBeFalsy();
    });

    test("object missing process is not outputstate", () => {
        type T = Omit<OutputState, "process">;
        const s: T = {
            "uninstall": () => {},
            "name": "foo",
            "addTransition": () => {},
            "fsm": fsm as FSM,
            "transitions": new Array<Transition<Event>>(),
            "exit": () => {},
            "checkStartingState": () => false,
            "acceptVisitor": () => {}
        };
        expect(isOutputStateType(s)).toBeFalsy();
    });

    test("object missing transitions is not outputstate", () => {
        type T = Omit<OutputState, "transitions">;
        const s: T = {
            "uninstall": () => {},
            "name": "foo",
            "addTransition": () => {},
            "fsm": fsm as FSM,
            "process": () => false,
            "exit": () => {},
            "checkStartingState": () => false,
            "acceptVisitor": () => {}
        };
        expect(isOutputStateType(s)).toBeFalsy();
    });

    test("object is outputstate", () => {
        const s: OutputState = {
            "uninstall": () => {},
            "name": "foo",
            "addTransition": () => {},
            "fsm": fsm as FSM,
            "transitions": new Array<Transition<Event>>(),
            "exit": () => {},
            "checkStartingState": () => false,
            "process": () => false,
            "acceptVisitor": () => {}
        };
        expect(isOutputStateType(s)).toBeTruthy();
    });
});
