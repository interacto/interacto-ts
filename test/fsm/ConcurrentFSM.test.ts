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

import {ConcurrentFSM} from "../../src/impl/fsm/ConcurrentFSM";
import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import type {FSMHandler} from "../../src/api/fsm/FSMHandler";
import {StdState} from "../../src/impl/fsm/StdState";
import {TerminalState} from "../../src/impl/fsm/TerminalState";
import {CancellingState} from "../../src/impl/fsm/CancellingState";
import {mock} from "jest-mock-extended";
import {createMouseEvent} from "../interaction/StubEvents";
import {MouseUpTransition} from "../../src/impl/fsm/MouseUpTransition";
import {ClickTransition} from "../../src/impl/fsm/ClickTransition";
import {MouseDownTransition} from "../../src/impl/fsm/MouseDownTransition";
import {MouseMoveTransition} from "../../src/impl/fsm/MouseMoveTransition";

class StubTouchFSM extends FSMImpl {
    public cpt: number;

    public constructor(cpt: number) {
        super();
        this.cpt = cpt;
        const touched = new StdState(this, "touched");
        const moved = new StdState(this, "mouved");
        const released = new TerminalState(this, "released");
        const cancelled = new CancellingState(this, "cancelled");
        this.addState(touched);
        this.addState(moved);
        this.addState(released);
        this.addState(cancelled);

        new class extends MouseDownTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(this.initState, touched);

        new class extends MouseMoveTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(touched, moved);

        new class extends MouseMoveTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(moved, moved);

        new class extends MouseUpTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(moved, released);

        new class extends ClickTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(moved, cancelled);
    }
}

let fsm: ConcurrentFSM<StubTouchFSM>;
let fsm1: StubTouchFSM;
let fsm2: StubTouchFSM;
let handler: FSMHandler;
let handler1: FSMHandler;
let handler2: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    fsm1 = new StubTouchFSM(1);
    fsm2 = new StubTouchFSM(2);
    handler = mock<FSMHandler>();
    handler1 = mock<FSMHandler>();
    handler2 = mock<FSMHandler>();
    fsm1.addHandler(handler1);
    fsm2.addHandler(handler2);
    fsm = new ConcurrentFSM([fsm1, fsm2]);
    fsm.addHandler(handler);
});

test("nb FSMs OK", () => {
    expect(fsm.conccurFSMs).toHaveLength(2);
});

test("log OK", () => {
    fsm1.log = false;
    fsm2.log = false;
    fsm.log = true;
    expect(fsm1.log).toBeTruthy();
    expect(fsm2.log).toBeTruthy();
});

test("log false", () => {
    fsm1.log = true;
    fsm2.log = true;
    fsm.log = true;
    fsm.log = false;
    expect(fsm1.log).toBeFalsy();
    expect(fsm2.log).toBeFalsy();
});

test("incorrect Event Does Nothing", () => {
    fsm.process(new Event("foo"));
    expect(fsm.started).toBeFalsy();
    expect(fsm1.started).toBeFalsy();
    expect(fsm2.started).toBeFalsy();
});

test("one mouse1 Does Not Start", () => {
    fsm.process(createMouseEvent("mousedown", document.createElement("button"), 0, 0, 0, 0, 1));
    expect(fsm.started).toBeFalsy();
    expect(fsm1.started).toBeTruthy();
    expect(fsm2.started).toBeFalsy();
});

test("one mouse2 Does Not Start", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    expect(fsm.started).toBeFalsy();
    expect(fsm1.started).toBeFalsy();
    expect(fsm2.started).toBeTruthy();
});

test("two differents Touch Events Start", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    expect(fsm.started).toBeTruthy();
    expect(fsm1.started).toBeTruthy();
    expect(fsm2.started).toBeTruthy();
});

test("twoDifferntsTouchEventsStart2", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    expect(fsm.started).toBeTruthy();
    expect(fsm1.started).toBeTruthy();
    expect(fsm2.started).toBeTruthy();
});

test("oneFullSequenceDoesNotRunTheFSM", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mouseup", b, 0, 0, 0, 0, 1));
    expect(handler.fsmStarts).not.toHaveBeenCalledWith();
    expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStarts).not.toHaveBeenCalledWith();
});

test("oneSequencePlusOtherStartedOK", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mouseup", b, 0, 0, 0, 0, 1));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStops).not.toHaveBeenCalled();
    expect(fsm2.started).toBeTruthy();
});

test("recyclingEventsOK", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mouseup", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    expect(fsm.started).toBeTruthy();
    expect(fsm1.started).toBeTruthy();
    expect(fsm2.started).toBeTruthy();
});

test("recyclingEventsOK2", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mouseup", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mouseup", b, 0, 0, 0, 0, 2));
    expect(fsm.started).toBeFalsy();
    expect(fsm1.started).toBeTruthy();
    expect(fsm2.started).toBeFalsy();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
    expect(handler1.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStops).toHaveBeenCalledTimes(1);
});

test("oneSequencePlusOtherThenCancel", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("click", b, 0, 0, 0, 0, 1));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler1.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler2.fsmCancels).not.toHaveBeenCalled();
    expect(fsm2.started).toBeTruthy();
});

test("reinit", () => {
    jest.spyOn(fsm1, "reinit");
    jest.spyOn(fsm2, "reinit");
    fsm.reinit();
    expect(fsm1.reinit).not.toHaveBeenCalled();
    expect(fsm2.reinit).not.toHaveBeenCalled();
});

test("full reinit", () => {
    jest.spyOn(fsm1, "fullReinit");
    jest.spyOn(fsm2, "fullReinit");
    fsm.fullReinit();
    expect(fsm1.fullReinit).not.toHaveBeenCalled();
    expect(fsm2.fullReinit).not.toHaveBeenCalled();
});

test("uninstall", () => {
    jest.spyOn(fsm1, "uninstall");
    jest.spyOn(fsm2, "uninstall");
    fsm.uninstall();
    expect(fsm1.uninstall).toHaveBeenCalledTimes(1);
    expect(fsm2.uninstall).toHaveBeenCalledTimes(1);
});
