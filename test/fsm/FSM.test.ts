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

import { FSM } from "../../src/fsm/FSM";
import { InitState } from "../../src/fsm/InitState";
import "jest";
import { StdState } from "../../src/fsm/StdState";
import { TerminalState, CancellingState, CancelFSMException, OutputState, InputState,
    TimeoutTransition, SubFSMTransition, catFSM } from "../../src";
import { StubFSMHandler } from "./StubFSMHandler";
import { StubTransitionOK } from "./StubTransitionOK";
import { StubEvent, StubSubEvent1, StubSubEvent2, StubSubEvent3 } from "./StubEvent";
import { Subject } from "rxjs";

jest.mock("../fsm/StubFSMHandler");

let fsm: FSM;
let handler: StubFSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSM();
    handler = new StubFSMHandler();
});

test("testInitState", () => {
    expect(fsm.getStates()).toHaveLength(1);
    expect(fsm.getStates()[0]).toBeInstanceOf(InitState);
});

test("testInner", () => {
    expect(fsm.getInner()).toBeFalsy();
});

test("testStartingState", () => {
    expect(fsm.getStartingState()).toStrictEqual(fsm.initState);
});

test("testCurrentStateAtStart", () => {
    expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
});

test("testAddState", () => {
    const state: StdState = new StdState(fsm, "s1");
    fsm.addState(state);
    expect(fsm.getStates()).toHaveLength(2);
});


test("testAddRemainingNotNull", () => {
    const evt = new StubEvent();
    fsm.addRemaningEventsToProcess(evt);
    expect(fsm.getEventsToProcess()).toStrictEqual([evt]);
});

test("testIsInner", () => {
    expect(fsm.getInner()).toBeFalsy();
});

test("testSetInnerTrue", () => {
    fsm.setInner(true);
    expect(fsm.getInner()).toBeTruthy();
});

test("testSetInnerFalse", () => {
    fsm.setInner(true);
    fsm.setInner(false);
    expect(fsm.getInner()).toBeFalsy();
});

test("testProcessRemainingEvents", () => {
    const evt = new StubEvent();
    fsm.addRemaningEventsToProcess(evt);
    fsm.onTerminating();
    expect(fsm.getEventsToProcess()).toHaveLength(0);
});

test("testOnTerminatingIfStarted", () => {
    fsm.onStarting();
    fsm.addHandler(handler);
    fsm.onTerminating();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("testOnTerminatingNotStarted", () => {
    fsm.addHandler(handler);
    fsm.onTerminating();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("testOnUpdatingIfStarted", () => {
    fsm.onStarting();
    fsm.addHandler(handler);
    fsm.onUpdating();
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testOnUpdatingNotStarted", () => {
    fsm.addHandler(handler);
    fsm.onUpdating();
    expect(handler.fsmUpdates).not.toHaveBeenCalled();
});


test("testOnTimeoutWithoutTimeout", () => {
    jest.spyOn(catFSM, "info");
    fsm.onTimeout();
    expect(catFSM.info).not.toHaveBeenCalled();
});


test("testUninstall", () => {
    const s1 = new StdState(fsm, "su");
    const subj = fsm.currentStateObservable() as {} as Subject<[OutputState, OutputState]>;
    jest.spyOn(s1, "uninstall");
    jest.spyOn(subj, "complete");
    fsm.addState(s1);
    fsm.addRemaningEventsToProcess(new StubEvent());
    fsm.uninstall();

    expect(fsm.getStates()).toHaveLength(0);
    expect(fsm.getEventsToProcess()).toHaveLength(0);
    expect(subj.complete).toHaveBeenCalledTimes(1);
    expect(s1.uninstall).toHaveBeenCalledTimes(1);
});

test("testCurrentStateChanged", () => {
    const changes: Array<[OutputState, OutputState]> = [];
    const newCurr = new StdState(fsm, "so");
    fsm.currentStateObservable().subscribe(e => changes.push(e));
    fsm.setCurrentState(newCurr);
    expect(changes).toHaveLength(1);
    expect(changes[0][1]).toStrictEqual(newCurr);
    expect(changes[0][0]).toStrictEqual(fsm.initState);
});


describe("testProcessUniqueEvent", () => {
    let std: StdState;
    let terminal: TerminalState;

    beforeEach(() => {
        fsm.addHandler(handler);
        fsm.log(true);
        std = new StdState(fsm, "s1");
        terminal = new TerminalState(fsm, "t1");
        new StubTransitionOK(fsm.initState, std);
        new StubTransitionOK(std, terminal);
        fsm.addState(std);
        fsm.addState(terminal);
    });

    test("testGetStates", () => {
        expect(fsm.getStates()).toStrictEqual([fsm.initState, std, terminal]);
    });

    test("testFireEventTriggerFSMStartUpdate", () => {
        fsm.process(new StubEvent());
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testFire2EventsToEnd", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testFireEventTriggerFSMUpdate", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testFireThreeEventRestartOK", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    });

    test("testRecycleEvent", () => {
        fsm.process(new StubEvent());
        fsm.addRemaningEventsToProcess(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.getCurrentState()).toBe(std);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(fsm.getEventsToProcess()).toHaveLength(0);
    });

    test("testReinit", () => {
        fsm.process(new StubEvent());
        fsm.reinit();
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testFullReinit", () => {
        fsm.process(new StubEvent());
        fsm.addRemaningEventsToProcess(new StubEvent());
        fsm.fullReinit();
        expect(fsm.getEventsToProcess()).toHaveLength(0);
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testCancelOnStart", () => {
        handler.fsmStarts = jest.fn(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
    });

    test("testCancelOnUpdate", () => {
        handler.fsmUpdates = jest.fn(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testCancelOnEnd", () => {
        handler.fsmStops = jest.fn(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("testHasStartedReinit", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(fsm.isStarted()).toBeFalsy();
    });

    test("testHasStarted", () => {
        fsm.process(new StubEvent());
        expect(fsm.isStarted()).toBeTruthy();
    });
});

describe("testProcessUniqueEvent -- cancel", () => {
    let std: StdState;
    let cancelling: CancellingState;

    beforeEach(() => {
        handler = new StubFSMHandler();
        fsm.addHandler(handler);
        fsm.log(true);
        std = new StdState(fsm, "s1");
        cancelling = new CancellingState(fsm, "c1");
        new StubTransitionOK(fsm.initState, std);
        new StubTransitionOK(std, cancelling);
        fsm.addState(std);
        fsm.addState(cancelling);
    });

    test("testCancellation", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testNoRecycleEventOnCancel", () => {
        fsm.process(new StubEvent());
        fsm.addRemaningEventsToProcess(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(fsm.getEventsToProcess()).toHaveLength(0);
    });
});


class SubStubTransition1 extends StubTransitionOK {
    public constructor(srcState: OutputState, tgtState: InputState, guard: boolean) {
        super(srcState, tgtState, guard);
    }
    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent1;
    }
    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent1"]);
    }
}

class SubStubTransition2 extends StubTransitionOK {
    public constructor(srcState: OutputState, tgtState: InputState, guard: boolean) {
        super(srcState, tgtState, guard);
    }
    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent2;
    }
    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent2"]);
    }
}

class SubStubTransition3 extends StubTransitionOK {
    public constructor(srcState: OutputState, tgtState: InputState, guard: boolean) {
        super(srcState, tgtState, guard);
    }
    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent3;
    }
    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent3"]);
    }
}


describe("testMultipleTransitionChoice", () => {
    let std: StdState;
    let terminal: TerminalState;
    let cancel: CancellingState;
    let iToS: StubTransitionOK;

    beforeEach(() => {
        fsm.addHandler(handler);
        fsm.log(true);
        std = new StdState(fsm, "s1");
        terminal = new TerminalState(fsm, "t1");
        cancel = new CancellingState(fsm, "c1");
        iToS = new StubTransitionOK(fsm.initState, std);
        new SubStubTransition1(std, terminal, true);
        new SubStubTransition2(std, cancel, true);
        new SubStubTransition3(std, std, true);
        fsm.addState(std);
        fsm.addState(terminal);
        fsm.addState(cancel);
    });

    test("testNotTriggeredIfGuardKO", () => {
        iToS.guard = false;
        fsm.process(new StubEvent());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("testNotTriggeredIfNotGoodEvent", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.getCurrentState()).toBe(std);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("testTriggerGoodChoice", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent2());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("testHasStartedReinitOnCancel", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent2());

        expect(fsm.isStarted()).toBeFalsy();
    });

    test("testTriggerGoodChoice2", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent1());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("check onstart not called when starting state diff", () => {
        fsm.setStartingState(terminal);
        fsm.process(new StubEvent());

        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("testStartingStateNotTriggeredSoNoUpdate", () => {
        fsm.setStartingState(terminal);
        fsm.process(new StubEvent());

        expect(handler.fsmUpdates).not.toHaveBeenCalled();
    });

    test("testStartingStateNotTriggeredSoNoCancel", () => {
        fsm.setStartingState(terminal);
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent2());

        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testStartingStateTriggeredOnTerminal", () => {
        fsm.setStartingState(terminal);
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent1());

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("testStartingStateOnRecursion", () => {
        fsm.setStartingState(std);
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent3());

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });
});

describe("testWithTimeoutTransition", () => {
    let std: StdState;
    let std2: StdState;
    let terminal: TerminalState;

    beforeEach(() => {
        jest.clearAllTimers();
        jest.useFakeTimers();
        fsm.addHandler(handler);
        fsm.log(true);
        std = new StdState(fsm, "s1");
        std2 = new StdState(fsm, "s2");
        terminal = new TerminalState(fsm, "t1");
        new StubTransitionOK(fsm.initState, std);
        new StubTransitionOK(std, terminal);
        new TimeoutTransition(std, std2, () => 100);
        new StubTransitionOK(std2, std);
        fsm.addState(std);
        fsm.addState(std2);
        fsm.addState(terminal);
    });

    test("testTimeoutChangeState", () => {
        fsm.log(true);
        fsm.process(new StubEvent());
        jest.runOnlyPendingTimers();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
        expect(fsm.getCurrentState()).toStrictEqual(std2);
    });

    test("testTimeoutStoppedOnOtherTransitionWithLog", () => {
        fsm.log(true);
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        jest.runOnlyPendingTimers();
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
    });

    test("testTimeoutStoppedOnOtherTransition", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
    });

    test("testTimeoutChangeStateThenCancel", () => {
        handler.fsmUpdates = jest.fn().mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        jest.runOnlyPendingTimers();
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });
});


describe("testWithSubFSM", () => {
    let mainfsm: FSM;
    let s1: StdState;
    let subS1: StdState;
    let subS2: StdState;
    let subT: TerminalState;
    let subC: CancellingState;

    beforeEach(() => {
        jest.clearAllMocks();
        fsm = new FSM();
        mainfsm = new FSM();
        s1 = new StdState(mainfsm, "s1");
        mainfsm.addState(s1);
        new SubFSMTransition(mainfsm.initState, s1, fsm);
        mainfsm.addHandler(handler);
        subS1 = new StdState(fsm, "sub1");
        subS2 = new StdState(fsm, "sub2");
        subT = new TerminalState(fsm, "t1");
        subC = new CancellingState(fsm, "c1");
        new SubStubTransition1(fsm.initState, subS1, true);
        new SubStubTransition2(subS1, subS2, true);
        new SubStubTransition1(subS2, subT, true);
        new SubStubTransition2(subS2, subC, true);
        fsm.addState(subS1);
        fsm.addState(subS2);
        fsm.addState(subT);
        fsm.addState(subC);
    });

    test("testEntersSubGoodCurrState", () => {
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.getCurrentState()).toStrictEqual(subS1);
        expect(fsm.getCurrentState()).toStrictEqual(subS1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });

    test("testNextSubStarteChangesMainCurrState", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        expect(mainfsm.getCurrentState()).toStrictEqual(subS2);
        expect(fsm.getCurrentState()).toStrictEqual(subS2);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    });

    test("testEntersSubTerminalGoNextMain", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.getCurrentState()).toStrictEqual(s1);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testEntersSubCancelCancelsMain", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent2());
        expect(mainfsm.getCurrentState()).toStrictEqual(mainfsm.initState);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("testReinitAlsoSubFSM", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.fullReinit();
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
    });

    test("testExitSubGoIntoCancelling", () => {
        const cancel: CancellingState = new CancellingState(mainfsm, "cancel1");
        mainfsm.addState(cancel);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, cancel, fsm);
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.getCurrentState()).toStrictEqual(mainfsm.initState);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("exit KO state type", () => {
        const stateKO = new class implements InputState {
            public enter(): void {
            }
            public getName(): string {
                return "foo";
            }
            public getFSM(): FSM {
                return mainfsm;
            }
            public checkStartingState(): void {
            }
            public uninstall(): void {
            }
        }();
        mainfsm.addState(stateKO);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, stateKO, fsm);
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.getCurrentState().getName()).toStrictEqual("sub2");
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testExitSubGoIntoTerminal", () => {
        const terminal: TerminalState = new TerminalState(mainfsm, "terminal1");
        mainfsm.addState(terminal);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, terminal, fsm);
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.getCurrentState()).toStrictEqual(mainfsm.initState);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });
});
