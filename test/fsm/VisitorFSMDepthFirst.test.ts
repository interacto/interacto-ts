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

import {ClickFSM, DnD, DoubleClickFSM, KeyTyped, LongTouch, MouseDown, MultiTouch, TouchDnD, VisitorFSMDepthFirst} from "../../src/interacto";
import {beforeEach, describe, expect, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {Logger, FSM, InputState, OutputState, State,
    Transition, TimeoutTransition, ConcurrentAndFSM, ConcurrentXOrFSM} from "../../src/interacto";

class StubVisitor extends VisitorFSMDepthFirst {
    public res = "";

    public override visitFSM(fsm: FSM): void {
        this.res += ">";
        super.visitFSM(fsm);
    }

    public override visitAndConcurrentFSM(fsm: ConcurrentAndFSM<FSM>): void {
        this.res += "&";
        super.visitAndConcurrentFSM(fsm);
    }

    public override visitXOrConcurrentFSM(fsm: ConcurrentXOrFSM<FSM>): void {
        this.res += "|";
        super.visitXOrConcurrentFSM(fsm);
    }

    public override visitState(state: OutputState & State): void {
        this.res += `s[${state.name}]`;
        super.visitState(state);
    }

    public override visitInitState(state: OutputState & State): void {
        this.res += `i[${state.name}]`;
        super.visitInitState(state);
    }

    public override visitCancellingState(state: InputState & State): void {
        this.res += `c[${state.name}]`;
        super.visitCancellingState(state);
    }

    public override visitTerminalState(state: InputState & State): void {
        this.res += `t[${state.name}]`;
        super.visitTerminalState(state);
    }

    public override visitTransition(transition: Transition<Event>): void {
        this.res += `-${Array.from(transition.getAcceptedEvents()).join(",")}-`;
        super.visitTransition(transition);
    }

    public override visitTimeoutTransition(transition: TimeoutTransition): void {
        this.res += "-timeout-";
        super.visitTimeoutTransition(transition);
    }
}

describe("using the std FSM visitor implementation", () => {
    let visitedFSM: FSM;
    let visitor: StubVisitor;

    beforeEach(() => {
        visitor = new StubVisitor();
    });

    test("visiting the mouse down FSM works", () => {
        visitedFSM = new MouseDown(mock<Logger>()).fsm;
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-mousedown-t[pressed]");
    });

    test("visiting the click FSM works", () => {
        visitedFSM = new ClickFSM(mock<Logger>());
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-click,auxclick-t[clicked]");
    });

    test("visiting the key typed FSM works", () => {
        visitedFSM = new KeyTyped(mock<Logger>()).fsm;
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-keydown-s[pressed]-keyup-t[typed]");
    });

    test("visiting the double click FSM works", () => {
        visitedFSM = new DoubleClickFSM(mock<Logger>());
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-click,auxclick-s[clicked]-mousemove-c[cancelled]-timeout-c[cancelled]-click,auxclick-t[dbleclicked]");
    });

    test("visiting the non-cancellable DnD FSM works", () => {
        visitedFSM = new DnD(false, mock<Logger>()).fsm;
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-mousedown-s[pressed]-mouseup-c[cancelled]-mousemove-s[dragged]-mousemove-s[dragged]-mouseup-t[released]");
    });

    test("visiting the long touch FSM works", () => {
        visitedFSM = new LongTouch(1000, mock<Logger>()).fsm;
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-touchstart-s[touched]-touchmove-c[cancelled]-touchend-c[cancelled]-timeout-t[timeouted]");
    });

    test("visiting the touch Dnd FSM works", () => {
        visitedFSM = new TouchDnD(mock<Logger>(), false).fsm;
        visitedFSM.acceptVisitor(visitor);
        expect(visitor.res).toBe(">i[init]-touchstart-s[touched]-touchstart-s[touched]-touchend-c[cancelled]-touchmove-s[moved]-touchmove-s[moved]-touchstart-s[touched]-touchend-t[released]-touchstart-c[cancelled]-touchstart-c[cancelled]");
    });

    test("visiting the multi-touch FSM works", () => {
        visitedFSM = new MultiTouch(2, false, mock<Logger>()).fsm;
        visitedFSM.acceptVisitor(visitor);
        const subFSM = ">i[init]-touchstart-s[touched]-touchstart-s[touched]-touchend-t[released]-touchmove-s[moved]-touchmove-s[moved]-touchstart-s[touched]-touchend-t[released]";
        expect(visitor.res).toBe(`&${subFSM}${subFSM}`);
    });
});
