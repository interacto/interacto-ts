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
    TimeoutTransition, SubFSMTransition } from "../../src";
import { StubFSMHandler } from "./StubFSMHandler";
import { StubTransitionOK } from "./StubTransitionOK";
import { StubEvent, StubSubEvent1, StubSubEvent2, StubSubEvent3 } from "./StubEvent";

jest.mock("../fsm/StubFSMHandler");

let fsm: FSM;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSM();
});

test("testInitState", () => {
    expect(fsm.getStates().length).toBe(1);
    expect(fsm.getStates()[0]).toBeInstanceOf(InitState);
});

test("testInner", () => {
    expect(fsm.inner).toBeFalsy();
});

test("testStartingState", () => {
    expect(fsm.startingState).toEqual(fsm.initState);
});

test("testCurrentStateAtStart", () => {
    expect(fsm.currentState).toEqual(fsm.initState);
});

test("testAddState", () => {
    const state: StdState = new StdState(fsm, "s1");
    fsm.addState(state);
    expect(fsm.getStates().length).toBe(2);
});


describe("TestProcessUniqueEvent", () => {
    let std: StdState;
    let terminal: TerminalState;
    let handler: StubFSMHandler;

    beforeEach(() => {
        handler = new StubFSMHandler();
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
        expect(fsm.getStates()).toEqual([fsm.initState, std, terminal]);
    });

    test("testFireEventTriggerFSMStartUpdate", () => {
        fsm.process(new StubEvent());
        expect(handler.fsmUpdates).toBeCalledTimes(1);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmCancels).not.toBeCalled();
        expect(handler.fsmStops).not.toBeCalled();
    });

    test("testFire2EventsToEnd", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testFireEventTriggerFSMUpdate", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(handler.fsmUpdates).toBeCalledTimes(1);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmStops).toBeCalledTimes(1);
        expect(handler.fsmCancels).not.toBeCalled();
    });

    test("testFireThreeEventRestartOK", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(handler.fsmStarts).toBeCalledTimes(2);
    });

    test("testRecycleEvent", () => {
        fsm.process(new StubEvent());
        fsm.addRemaningEventsToProcess(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.currentState).toBe(std);
        expect(handler.fsmStarts).toBeCalledTimes(2);
        expect(fsm.getEventsToProcess().length).toEqual(0);
    });

    test("testReinit", () => {
        fsm.process(new StubEvent());
        fsm.reinit();
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testFullReinit", () => {
        fsm.process(new StubEvent());
        fsm.addRemaningEventsToProcess(new StubEvent());
        fsm.fullReinit();
        expect(fsm.getEventsToProcess().length).toEqual(0);
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testCancelOnStart", () => {
        handler.fsmStarts = jest.fn(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmCancels).toBeCalledTimes(1);
        expect(handler.fsmStops).not.toBeCalled();
        expect(handler.fsmUpdates).not.toBeCalled();
    });

    test("testCancelOnUpdate", () => {
        handler.fsmUpdates = jest.fn(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmCancels).toBeCalledTimes(1);
        expect(handler.fsmUpdates).toBeCalledTimes(1);
        expect(handler.fsmStops).not.toBeCalled();
    });

    test("testCancelOnEnd", () => {
        handler.fsmStops = jest.fn(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmCancels).toBeCalledTimes(1);
        expect(handler.fsmUpdates).toBeCalledTimes(1);
        expect(handler.fsmStops).toBeCalledTimes(1);
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

describe("TestProcessUniqueEvent -- cancel", () => {
    let std: StdState;
    let cancelling: CancellingState;
    let handler: StubFSMHandler;

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

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmCancels).toBeCalledTimes(1);
        expect(handler.fsmStops).not.toBeCalled();
    });

    test("testNoRecycleEventOnCancel", () => {
        fsm.process(new StubEvent());
        fsm.addRemaningEventsToProcess(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmCancels).toBeCalledTimes(1);
        expect(fsm.getEventsToProcess().length).toEqual(0);
    });
});


class SubStubTransition1 extends StubTransitionOK {
	constructor(srcState: OutputState, tgtState: InputState, guard: boolean) {
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
	constructor(srcState: OutputState, tgtState: InputState, guard: boolean) {
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
	constructor(srcState: OutputState, tgtState: InputState, guard: boolean) {
		super(srcState, tgtState, guard);
	}
	public accept(event: StubEvent): boolean {
		return event instanceof StubSubEvent3;
	}
	public getAcceptedEvents(): Set<string> {
		return new Set(["StubSubEvent3"]);
	}
}


describe("TestMultipleTransitionChoice", () => {
    let std: StdState;
    let terminal: TerminalState;
    let cancel: CancellingState;
    let iToS: StubTransitionOK;
    let handler: StubFSMHandler;

    beforeEach(() => {
        handler = new StubFSMHandler();
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

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).not.toBeCalled();
    });

    test("testNotTriggeredIfNotGoodEvent", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());

        expect(fsm.currentState).toBe(std);
        expect(handler.fsmCancels).not.toBeCalled();
        expect(handler.fsmStops).not.toBeCalled();
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmUpdates).toBeCalledTimes(1);
    });

    test("testTriggerGoodChoice", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent2());

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStops).not.toBeCalled();
        expect(handler.fsmCancels).toBeCalledTimes(1);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmUpdates).toBeCalledTimes(1);
    });

    test("testHasStartedReinitOnCancel", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent2());

        expect(fsm.isStarted()).toBeFalsy();
    });

    test("testTriggerGoodChoice2", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent1());

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmCancels).not.toBeCalled();
        expect(handler.fsmStops).toBeCalledTimes(1);
        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmUpdates).toBeCalledTimes(1);
    });

    test("Check onstart not called when starting state diff", () => {
        fsm.startingState = terminal;
        fsm.process(new StubEvent());

        expect(handler.fsmStarts).not.toBeCalled();
    });

    test("testStartingStateNotTriggeredSoNoUpdate", () => {
        fsm.startingState = terminal;
        fsm.process(new StubEvent());

        expect(handler.fsmUpdates).not.toBeCalled();
    });

    test("testStartingStateNotTriggeredSoNoCancel", () => {
        fsm.startingState = terminal;
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent2());

        expect(handler.fsmCancels).not.toBeCalled();
    });

    test("testStartingStateTriggeredOnTerminal", () => {
        fsm.startingState = terminal;
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent1());

        expect(handler.fsmStarts).toBeCalledTimes(1);
        expect(handler.fsmStops).toBeCalledTimes(1);
    });

    test("testStartingStateOnRecursion", () => {
        fsm.startingState = std;
        fsm.process(new StubEvent());
        fsm.process(new StubSubEvent3());

        expect(handler.fsmStarts).toBeCalledTimes(1);
    });
});

describe("TestWithTimeoutTransition", () => {
    let std: StdState;
    let std2: StdState;
    let terminal: TerminalState;
    let handler: StubFSMHandler;

    beforeEach(() => {
        jest.clearAllTimers();
        jest.useFakeTimers();
        handler = new StubFSMHandler();
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
        fsm.process(new StubEvent());
        jest.runOnlyPendingTimers();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
        expect(fsm.currentState).toEqual(std2);
    });

    test("testTimeoutStoppedOnOtherTransition", () => {
        fsm.process(new StubEvent());
        fsm.process(new StubEvent());
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(fsm.currentState).toEqual(fsm.initState);
    });

    test("testTimeoutChangeStateThenCancel", () => {
        handler.fsmUpdates = jest.fn().mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(new StubEvent());
        jest.runOnlyPendingTimers();
        expect(fsm.currentState).toEqual(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });
});


describe("TestWithSubFSM", () => {
    let mainfsm: FSM;
    let s1: StdState;
    let subS1: StdState;
    let subS2: StdState;
    let subT: TerminalState;
    let subC: CancellingState;
    let handler: StubFSMHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        handler = new StubFSMHandler();
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
        expect(mainfsm.currentState).toEqual(subS1);
        expect(fsm.currentState).toEqual(subS1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });

    test("testNextSubStarteChangesMainCurrState", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        expect(mainfsm.currentState).toEqual(subS2);
        expect(fsm.currentState).toEqual(subS2);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    });

    test("testEntersSubTerminalGoNextMain", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.currentState).toEqual(s1);
        expect(fsm.currentState).toEqual(fsm.initState);
        expect(handler.fsmStops).not.toBeCalled();
        expect(handler.fsmCancels).not.toBeCalled();
    });

    test("testEntersSubCancelCancelsMain", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent2());
        expect(mainfsm.currentState).toEqual(mainfsm.initState);
        expect(fsm.currentState).toEqual(fsm.initState);
        expect(handler.fsmStops).not.toBeCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("testReinitAlsoSubFSM", () => {
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.fullReinit();
        expect(fsm.currentState).toEqual(fsm.initState);
    });

    test("testExitSubGoIntoCancelling", () => {
        const cancel: CancellingState = new CancellingState(mainfsm, "cancel1");
        mainfsm.addState(cancel);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, cancel, fsm);
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.currentState).toEqual(mainfsm.initState);
        expect(fsm.currentState).toEqual(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("testExitSubGoIntoTerminal", () => {
        const terminal: TerminalState = new TerminalState(mainfsm, "terminal1");
        mainfsm.addState(terminal);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, terminal, fsm);
        mainfsm.process(new StubSubEvent1());
        mainfsm.process(new StubSubEvent2());
        mainfsm.process(new StubSubEvent1());
        expect(mainfsm.currentState).toEqual(mainfsm.initState);
        expect(fsm.currentState).toEqual(fsm.initState);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });
});
