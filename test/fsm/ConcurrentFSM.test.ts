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

import { ConcurrentFSM } from "../../src/fsm/ConcurrentFSM";
import { FSM } from "../../src/fsm/FSM";
import { FSMHandler } from "../../src/fsm/FSMHandler";
import { StdState } from "../../src/fsm/StdState";
import { TerminalState } from "../../src/fsm/TerminalState";
import { CancellingState } from "../../src/fsm/CancellingState";
import { Transition } from "../../src/fsm/Transition";
import { OutputState } from "../../src/fsm/OutputState";
import { InputState } from "../../src/fsm/InputState";
import { StubFSMHandler } from "./StubFSMHandler";

class StubTouchFSM extends FSM {
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

        new class extends Transition {
            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }
            public accept(_event: Event): boolean {
                return true;
            }
            public isGuardOK(event: Event): boolean {
                return `touch${cpt}` === event.type;
            }
            public getAcceptedEvents(): Set<string> {
                return new Set(`touch${cpt}`);
            }
        }(this.initState, touched);

        new class extends Transition {
            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }
            public accept(_event: Event): boolean {
                return true;
            }
            public isGuardOK(event: Event): boolean {
                return `move${cpt}` === event.type;
            }
            public getAcceptedEvents(): Set<string> {
                return new Set(`move${cpt}`);
            }
        }(touched, moved);

        new class extends Transition {
            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }
            public accept(_event: Event): boolean {
                return true;
            }
            public isGuardOK(event: Event): boolean {
                return `move${cpt}` === event.type;
            }
            public getAcceptedEvents(): Set<string> {
                return new Set(`move${cpt}`);
            }
        }(moved, moved);

        new class extends Transition {
            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }
            public accept(_event: Event): boolean {
                return true;
            }
            public isGuardOK(event: Event): boolean {
                return `release${cpt}` === event.type;
            }
            public getAcceptedEvents(): Set<string> {
                return new Set(`release${cpt}`);
            }
        }(moved, released);

        new class extends Transition {
            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }
            public accept(_event: Event): boolean {
                return true;
            }
            public isGuardOK(event: Event): boolean {
                return `cancel${cpt}` === event.type;
            }
            public getAcceptedEvents(): Set<string> {
                return new Set(`cancel${cpt}`);
            }
        }(moved, cancelled);
    }
}

jest.mock("../fsm/StubFSMHandler");

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
    handler = new StubFSMHandler();
    handler1 = new StubFSMHandler();
    handler2 = new StubFSMHandler();
    fsm1.addHandler(handler1);
    fsm2.addHandler(handler2);
    fsm = new ConcurrentFSM(new Set([fsm1, fsm2]));
    fsm.addHandler(handler);
});

test("cons OK error", () => {
    expect(() => new ConcurrentFSM(new Set<FSM>([fsm1]))).toThrow(Error);
});

test("cons OK error empty", () => {
    expect(() => new ConcurrentFSM(new Set<FSM>())).toThrow(Error);
});

test("nb FSMs OK", () => {
    expect(fsm.getConccurFSMs()).toHaveLength(2);
});

test("returns copy FSMs", () => {
    fsm.getConccurFSMs().length = 0;
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
    fsm.process(new Event("touchNothing"));
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeFalsy();
    expect(fsm2.isStarted()).toBeFalsy();
});

test("one touch1 Does Not Start", () => {
    fsm.process(new Event("touch1"));
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeFalsy();
});

test("one Event2 Does Not Start", () => {
    fsm.process(new Event("touch2"));
    expect(fsm.isStarted()).toBeFalsy();
    expect(fsm1.isStarted()).toBeFalsy();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("twoDifferntsTouchEventsStart", () => {
    fsm.process(new Event("touch1"));
    fsm.process(new Event("touch2"));
    expect(fsm.isStarted()).toBeTruthy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("twoDifferntsTouchEventsStart2", () => {
    fsm.process(new Event("touch2"));
    fsm.process(new Event("touch1"));
    expect(fsm.isStarted()).toBeTruthy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("oneFullSequenceDoesNotRunTheFSM", () => {
    fsm.process(new Event("touch1"));
    fsm.process(new Event("move1"));
    fsm.process(new Event("release1"));
    expect(handler.fsmStarts).not.toHaveBeenCalledWith();
    expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStarts).not.toHaveBeenCalledWith();
});

test("oneSequencePlusOtherStartedOK", () => {
    fsm.process(new Event("touch1"));
    fsm.process(new Event("move1"));
    fsm.process(new Event("touch2"));
    fsm.process(new Event("release1"));
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler2.fsmStops).not.toHaveBeenCalled();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("recyclingEventsOK", () => {
    fsm.process(new Event("touch1"));
    fsm.process(new Event("move1"));
    fsm.process(new Event("touch2"));
    fsm.process(new Event("release1"));
    fsm.process(new Event("touch1"));
    expect(fsm.isStarted()).toBeTruthy();
    expect(fsm1.isStarted()).toBeTruthy();
    expect(fsm2.isStarted()).toBeTruthy();
});

test("recyclingEventsOK2", () => {
    fsm.process(new Event("touch1"));
    fsm.process(new Event("move1"));
    fsm.process(new Event("touch2"));
    fsm.process(new Event("move2"));
    fsm.process(new Event("release1"));
    fsm.process(new Event("touch1"));
    fsm.process(new Event("release2"));
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
    fsm.process(new Event("touch1"));
    fsm.process(new Event("move1"));
    fsm.process(new Event("touch2"));
    fsm.process(new Event("cancel1"));
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
