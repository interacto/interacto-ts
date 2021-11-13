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

import type {Subject} from "rxjs";
import type {FSMHandler, InputState, Logger, OutputState} from "../../src/interacto";
import {
    CancelFSMException,
    CancellingState,
    FSMImpl,
    InitState,
    StdState,
    SubFSMTransition,
    TerminalState,
    TimeoutTransition
} from "../../src/interacto";
import {StubTransitionOK, SubStubTransition1, SubStubTransition2, SubStubTransition3} from "./StubTransitionOK";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {createKeyEvent, createMouseEvent, createTouchEvent} from "../interaction/StubEvents";

let fsm: FSMImpl;
let handler: FSMHandler & MockProxy<FSMHandler>;
let logger: Logger;

beforeEach(() => {
    logger = mock<Logger>();
    jest.clearAllMocks();
    fsm = new FSMImpl(logger);
    handler = mock<FSMHandler>();
});

test("testInitState", () => {
    expect(fsm.states).toHaveLength(1);
    expect(fsm.states[0]).toBeInstanceOf(InitState);
});

test("get init state", () => {
    expect(fsm.initState).toBeInstanceOf(InitState);
    expect(fsm.initState).toBe(fsm.states[0]);
});

test("testInner", () => {
    expect(fsm.inner).toBeFalsy();
});

test("testStartingState", () => {
    expect(fsm.startingState).toStrictEqual(fsm.initState);
});

test("testCurrentStateAtStart", () => {
    expect(fsm.currentState).toStrictEqual(fsm.initState);
});

test("testAddState", () => {
    const state: StdState = new StdState(fsm, "s1");
    fsm.addState(state);
    expect(fsm.states).toHaveLength(2);
});


test("testAddRemainingNotNull", () => {
    const evt = mock<Event>();
    fsm.addRemaningEventsToProcess(evt);
    expect(fsm.getEventsToProcess()).toStrictEqual([evt]);
});

test("testIsInner", () => {
    expect(fsm.inner).toBeFalsy();
});

test("testSetInnerTrue", () => {
    fsm.inner = true;
    expect(fsm.inner).toBeTruthy();
});

test("testSetInnerFalse", () => {
    fsm.inner = true;
    fsm.inner = false;
    expect(fsm.inner).toBeFalsy();
});

test("testProcessRemainingEvents", () => {
    const evt = mock<Event>();
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
    fsm.onTimeout();
    expect(logger.logInteractionMsg).not.toHaveBeenCalled();
});

test("that errors caught on start with an error", () => {
    handler.fsmStarts.mockImplementation(() => {
        throw new Error("crash provoked");
    });
    fsm.addHandler(handler);

    expect(() => {
        fsm.onStarting();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on start with an error with no logger", () => {
    fsm = new FSMImpl();
    handler.fsmStarts.mockImplementation(() => {
        throw new Error("crash provoked");
    });
    fsm.addHandler(handler);

    expect(() => {
        fsm.onStarting();
    }).not.toThrow();
});

test("that errors caught on start with not an error", () => {
    handler.fsmStarts.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "42";
    });
    fsm.addHandler(handler);

    expect(() => {
        fsm.onStarting();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on update with an error", () => {
    handler.fsmUpdates.mockImplementation(() => {
        throw new Error("crash provoked on update");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onUpdating();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on update with an error with no logger", () => {
    fsm = new FSMImpl();
    handler.fsmUpdates.mockImplementation(() => {
        throw new Error("crash provoked on update");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onUpdating();
    }).not.toThrow();
});

test("that errors caught on update with not an error", () => {
    handler.fsmUpdates.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "err";
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onUpdating();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on end with an error", () => {
    handler.fsmStops.mockImplementation(() => {
        throw new Error("crash provoked on end");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onTerminating();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on end with an error with no logger", () => {
    fsm = new FSMImpl();
    handler.fsmStops.mockImplementation(() => {
        throw new Error("crash provoked on end");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onTerminating();
    }).not.toThrow();
});

test("that errors caught on end with not an error", () => {
    handler.fsmStops.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "foo";
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onTerminating();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on cancel with an error", () => {
    handler.fsmCancels.mockImplementation(() => {
        throw new Error("crash provoked on cancel");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onCancelling();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});

test("that errors caught on cancel with an error with no logger", () => {
    fsm = new FSMImpl();
    handler.fsmCancels.mockImplementation(() => {
        throw new Error("crash provoked on cancel");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onCancelling();
    }).not.toThrow();
});

test("that errors caught on cancel with not an error", () => {
    handler.fsmCancels.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "yolo";
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onCancelling();
    }).not.toThrow();
    expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
});


test("testUninstall", () => {
    const s1 = new StdState(fsm, "su");
    const subj = fsm.currentStateObservable as unknown as Subject<[OutputState, OutputState]>;
    jest.spyOn(s1, "uninstall");
    jest.spyOn(subj, "complete");
    fsm.addState(s1);
    fsm.addRemaningEventsToProcess(mock<Event>());
    fsm.uninstall();

    expect(fsm.states).toHaveLength(0);
    expect(fsm.getEventsToProcess()).toHaveLength(0);
    expect(subj.complete).toHaveBeenCalledTimes(1);
    expect(s1.uninstall).toHaveBeenCalledTimes(1);
});

test("testCurrentStateChanged", () => {
    const changes: Array<[OutputState, OutputState]> = [];
    const newCurr = new StdState(fsm, "so");
    fsm.currentStateObservable.subscribe(e => changes.push(e));
    fsm.currentState = newCurr;
    expect(changes).toHaveLength(1);
    expect(changes[0][1]).toStrictEqual(newCurr);
    expect(changes[0][0]).toStrictEqual(fsm.initState);
});


describe("testProcessUniqueEvent", () => {
    let std: StdState;
    let terminal: TerminalState;

    beforeEach(() => {
        fsm.addHandler(handler);
        fsm.log = true;
        std = new StdState(fsm, "s1");
        terminal = new TerminalState(fsm, "t1");
        new StubTransitionOK(fsm.initState, std);
        new StubTransitionOK(std, terminal);
        fsm.addState(std);
        fsm.addState(terminal);
    });

    test("testGetStates", () => {
        expect(fsm.states).toStrictEqual([fsm.initState, std, terminal]);
    });

    test("testFireEventTriggerFSMStartUpdate", () => {
        fsm.process(mock<Event>());
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testFire2EventsToEnd", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testFireEventTriggerFSMUpdate", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testFireThreeEventRestartOK", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    });

    test("testRecycleEvent", () => {
        fsm.process(mock<Event>());
        fsm.addRemaningEventsToProcess(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.currentState).toBe(std);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(fsm.getEventsToProcess()).toHaveLength(0);
    });

    test("testReinit", () => {
        fsm.process(mock<Event>());
        fsm.reinit();
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testFullReinit", () => {
        fsm.process(mock<Event>());
        fsm.addRemaningEventsToProcess(mock<Event>());
        fsm.fullReinit();
        expect(fsm.getEventsToProcess()).toHaveLength(0);
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testCancelOnStart", () => {
        handler.fsmStarts.mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(mock<Event>());
        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
    });

    test("testCancelOnUpdate", () => {
        handler.fsmUpdates.mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(mock<Event>());
        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testCancelOnEnd", () => {
        handler.fsmStops.mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("testHasStartedReinit", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(fsm.started).toBeFalsy();
    });

    test("testHasStarted", () => {
        fsm.process(mock<Event>());
        expect(fsm.started).toBeTruthy();
    });
});

describe("testProcessUniqueEvent -- cancel", () => {
    let std: StdState;
    let cancelling: CancellingState;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        fsm.addHandler(handler);
        fsm.log = true;
        std = new StdState(fsm, "s1");
        cancelling = new CancellingState(fsm, "c1");
        new StubTransitionOK(fsm.initState, std);
        new StubTransitionOK(std, cancelling);
        fsm.addState(std);
        fsm.addState(cancelling);
    });

    test("testCancellation", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testNoRecycleEventOnCancel", () => {
        fsm.process(mock<Event>());
        fsm.addRemaningEventsToProcess(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(fsm.getEventsToProcess()).toHaveLength(0);
    });
});


describe("testMultipleTransitionChoice", () => {
    let std: StdState;
    let terminal: TerminalState;
    let cancel: CancellingState;
    let iToS: StubTransitionOK<Event>;

    beforeEach(() => {
        fsm.addHandler(handler);
        fsm.log = true;
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
        fsm.process(mock<Event>());

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("testNotTriggeredIfNotGoodEvent", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.currentState).toBe(std);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("testTriggerGoodChoice", () => {
        fsm.process(mock<Event>());
        fsm.process(createKeyEvent("keydown", "a"));

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("testHasStartedReinitOnCancel", () => {
        fsm.process(mock<Event>());
        fsm.process(createKeyEvent("keydown", "a"));

        expect(fsm.started).toBeFalsy();
    });

    test("testTriggerGoodChoice2", () => {
        fsm.process(mock<Event>());
        fsm.process(createMouseEvent("click", document.createElement("button")));

        expect(fsm.currentState).toBe(fsm.initState);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("check onstart not called when starting state diff", () => {
        fsm.startingState = terminal;
        fsm.process(mock<Event>());

        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("testStartingStateNotTriggeredSoNoUpdate", () => {
        fsm.startingState = terminal;
        fsm.process(mock<Event>());

        expect(handler.fsmUpdates).not.toHaveBeenCalled();
    });

    test("testStartingStateNotTriggeredSoNoCancel", () => {
        fsm.startingState = terminal;
        fsm.process(mock<Event>());
        fsm.process(createKeyEvent("keydown", "a"));

        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testStartingStateTriggeredOnTerminal", () => {
        fsm.startingState = terminal;
        fsm.process(mock<Event>());
        fsm.process(createMouseEvent("click", document.createElement("button")));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("testStartingStateOnRecursion", () => {
        fsm.startingState = std;
        fsm.process(mock<Event>());
        fsm.process(createTouchEvent("touchstart", 1, document.createElement("button")));

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
        fsm.log = true;
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
        fsm.log = true;
        fsm.process(mock<Event>());
        jest.runOnlyPendingTimers();
        expect(fsm.currentState).toStrictEqual(std2);
    });

    test("testTimeoutStoppedOnOtherTransitionWithLog", () => {
        fsm.log = true;
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        jest.runOnlyPendingTimers();
        expect(fsm.currentState).toStrictEqual(fsm.initState);
    });

    test("testTimeoutStoppedOnOtherTransition", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(fsm.currentState).toStrictEqual(fsm.initState);
    });

    test("testTimeoutChangeStateThenCancel", () => {
        handler.fsmUpdates.mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(mock<Event>());
        jest.runOnlyPendingTimers();
        expect(fsm.currentState).toStrictEqual(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });
});


describe("testWithSubFSM", () => {
    let mainfsm: FSMImpl;
    let s1: StdState;
    let subS1: StdState;
    let subS2: StdState;
    let subT: TerminalState;
    let subC: CancellingState;

    beforeEach(() => {
        jest.clearAllMocks();
        fsm = new FSMImpl();
        mainfsm = new FSMImpl();
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

    test("check log when processing event with sub FSM", () => {
        fsm = new FSMImpl(logger);
        mainfsm = new FSMImpl(logger);
        s1 = new StdState(mainfsm, "s1");
        mainfsm.addState(s1);
        new SubFSMTransition(mainfsm.initState, s1, fsm);
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
        fsm.log = true;
        mainfsm.log = true;
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(17);
    });

    test("check no log when processing event with sub FSM", () => {
        fsm = new FSMImpl(logger);
        mainfsm = new FSMImpl(logger);
        s1 = new StdState(mainfsm, "s1");
        mainfsm.addState(s1);
        new SubFSMTransition(mainfsm.initState, s1, fsm);
        fsm.log = false;
        mainfsm.log = false;
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("check log when processing event with no logger with sub FSM", () => {
        fsm.log = true;
        mainfsm.log = true;
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("testEntersSubGoodCurrState", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.currentState).toStrictEqual(subS1);
        expect(fsm.currentState).toStrictEqual(subS1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });

    test("testNextSubStarteChangesMainCurrState", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        expect(mainfsm.currentState).toStrictEqual(subS2);
        expect(fsm.currentState).toStrictEqual(subS2);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    });

    test("testEntersSubTerminalGoNextMain", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.currentState).toStrictEqual(s1);
        expect(fsm.currentState).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testEntersSubCancelCancelsMain", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createKeyEvent("keydown", "b"));
        expect(mainfsm.currentState).toStrictEqual(mainfsm.initState);
        expect(fsm.currentState).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("testReinitAlsoSubFSM", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.fullReinit();
        expect(fsm.currentState).toStrictEqual(fsm.initState);
    });

    test("testExitSubGoIntoCancelling", () => {
        const cancel: CancellingState = new CancellingState(mainfsm, "cancel1");
        mainfsm.addState(cancel);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, cancel, fsm);
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.currentState).toStrictEqual(mainfsm.initState);
        expect(fsm.currentState).toStrictEqual(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("exit KO state type", () => {
        const stateKO = new class implements InputState {
            public enter(): void {
            }

            public readonly name = "foo";

            public get fsm(): FSMImpl {
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
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.currentState.name).toBe("sub2");
        expect(fsm.currentState).toBe(fsm.initState);
    });

    test("testExitSubGoIntoTerminal", () => {
        const terminal: TerminalState = new TerminalState(mainfsm, "terminal1");
        mainfsm.addState(terminal);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, terminal, fsm);
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.currentState).toStrictEqual(mainfsm.initState);
        expect(fsm.currentState).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });
});
