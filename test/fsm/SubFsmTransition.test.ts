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

import {SubStubTransition1} from "./StubTransitionOk";
import {FSMImpl, SubFSMTransitionImpl} from "../../src/interacto";
import {createMouseEvent} from "../interaction/StubEvents";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {InputState, Logger, Transition, StdState, TerminalState, EventType} from "../../src/interacto";

describe("using a sub fsm transition", () => {
    let tr: SubFSMTransitionImpl;
    let fsm: FSMImpl;
    let mainfsm: FSMImpl;
    let s1: StdState;
    let s2: StdState;
    let subS: TerminalState;

    beforeEach(() => {
        jest.clearAllMocks();
        fsm = new FSMImpl(mock<Logger>());
        mainfsm = new FSMImpl(mock<Logger>());
        s1 = mainfsm.addStdState("s1");
        s2 = mainfsm.addStdState("s2");
        subS = fsm.addTerminalState("sub1");
        tr = new SubFSMTransitionImpl(s1, s2, fsm);

        new SubStubTransition1(fsm.initState, subS, true);
    });

    test("inner", () => {
        expect(fsm.inner).toBeTruthy();
        expect(mainfsm.inner).toBeFalsy();
    });

    test("get sub fsm", () => {
        expect(tr.getSubFSM()).toBe(fsm);
    });

    test("acceptFirstEvent", () => {
        expect(tr.accept(createMouseEvent("click", document.createElement("button")))).toBeTruthy();
    });

    test("notAcceptFirstEvent", () => {
        expect(tr.accept(createMouseEvent("mousemove", document.createElement("button")))).toBeFalsy();
    });

    test("guardOKFirstEvent", () => {
        expect(tr.guard(createMouseEvent("click", document.createElement("button")))).toBeTruthy();
    });

    test("guardKOFirstEvent", () => {
        expect(tr.guard(createMouseEvent("mousemove", document.createElement("button")))).toBeFalsy();
    });

    test("executeFirstEventReturnsSubState", () => {
        const state: InputState | undefined = tr.execute(createMouseEvent("click", document.createElement("button")));
        expect(state).toBeDefined();
        expect(state).toStrictEqual(subS);
    });

    test("execute no transition", () => {
        const state: InputState | undefined = tr.execute(createMouseEvent("mousemove", document.createElement("button")));
        expect(state).toBeUndefined();
    });

    test("executeFirstEventKO", () => {
        const state: InputState | undefined = tr.execute(createMouseEvent("mousemove", document.createElement("button")));
        expect(state).toBeUndefined();
    });

    test("uninstall", () => {
        tr = new SubFSMTransitionImpl(s1, s2, fsm);
        jest.spyOn(fsm, "uninstall");
        tr.uninstall();
        expect(fsm.uninstall).toHaveBeenCalledTimes(1);
    });

    test("get accepted events", () => {
        const tr2 = {} as Transition<Event>;
        tr2.getAcceptedEvents = jest.fn<() => ReadonlySet<EventType>>(() => new Set(["click", "auxclick"]));
        fsm.initState.addTransition(tr2);
        const evts = tr.getAcceptedEvents();
        expect(Array.from(evts)).toHaveLength(2);
        expect(evts.has("click")).toBeTruthy();
        expect(evts.has("auxclick")).toBeTruthy();
        expect(evts.has(Array.from(fsm.initState.transitions[0].getAcceptedEvents())[0])).toBeTruthy();
    });

    test("get accepted events when nothing to return", () => {
        fsm.initState.clearTransitions();
        const evts = tr.getAcceptedEvents();
        expect(Array.from(evts)).toHaveLength(0);
    });

    test("executeExitSrcState", () => {
        jest.spyOn(s1, "exit");
        tr.execute(createMouseEvent("click", document.createElement("button")));
        expect(s1.exit).toHaveBeenCalledTimes(1);
    });

    test("executeEnterTgtState", () => {
        jest.spyOn(s2, "enter");
        tr.execute(createMouseEvent("click", document.createElement("button")));
        expect(s2.enter).toHaveBeenCalledTimes(1);
    });
});
