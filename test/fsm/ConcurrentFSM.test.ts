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
import {MoveTransition} from "../../src/impl/fsm/MoveTransition";
import {ReleaseTransition} from "../../src/impl/fsm/ReleaseTransition";
import {ClickTransition} from "../../src/impl/fsm/ClickTransition";
import {PressureTransition} from "../../src/impl/fsm/PressureTransition";

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

        new class extends PressureTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(this.initState, touched);

        new class extends MoveTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(touched, moved);

        new class extends MoveTransition {
            public override isGuardOK(event: MouseEvent): boolean {
                return event.button === cpt;
            }
        }(moved, moved);

        new class extends ReleaseTransition {
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

test("cons OK error", () => {
    expect(() => new ConcurrentFSM([fsm1])).toThrow(Error);
});

test("cons OK error empty", () => {
    expect(() => new ConcurrentFSM(Array<FSMImpl>())).toThrow(Error);
});

test("nb FSMs OK", () => {
    expect(fsm.getConccurFSMs()).toHaveLength(2);
});

test("log OK", () => {
    jest.spyOn(fsm1, "log");
    jest.spyOn(fsm2, "log");
    fsm.log(true);
    expect(fsm1.log).toHaveBeenCalledWith(true);
    expect(fsm2.log).toHaveBeenCalledWith(true);
});

test("log false", () => {
    jest.spyOn(fsm1, "log");
    jest.spyOn(fsm2, "log");
    fsm.log(true);
    fsm.log(false);
    expect(fsm1.log).toHaveBeenCalledWith(false);
    expect(fsm2.log).toHaveBeenCalledWith(false);
});

test("incorrect Event Does Nothing", () => {
    fsm.process(new Event("foo"));
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeFalsy();
    expect(fsm2.isStarted()).toBeFalsy();
});

test("one mouse1 Does Not Start", () => {
    fsm.process(createMouseEvent("mousedown", document.createElement("button"), 0, 0, 0, 0, 1));
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeFalsy();
});

test("one mouse2 Does Not Start", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeFalsy();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("two differents Touch Events Start", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    expect(fsm.isStarted()).toBeTruthy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("twoDifferntsTouchEventsStart2", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    expect(fsm.isStarted()).toBeTruthy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeTruthy();
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
    expect(fsm2.isStarted()).toBeTruthy();
});

test("recyclingEventsOK", () => {
    const b = document.createElement("button");
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousemove", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 2));
    fsm.process(createMouseEvent("mouseup", b, 0, 0, 0, 0, 1));
    fsm.process(createMouseEvent("mousedown", b, 0, 0, 0, 0, 1));
    expect(fsm.isStarted()).toBeTruthy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeTruthy();
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
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeFalsy();
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
    expect(fsm2.isStarted()).toBeTruthy();
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
