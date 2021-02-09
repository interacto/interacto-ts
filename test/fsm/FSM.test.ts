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

import {Subject} from "rxjs";
import {CancelFSMException} from "../../src/impl/fsm/CancelFSMException";
import {CancellingState} from "../../src/impl/fsm/CancellingState";
import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {InitState} from "../../src/impl/fsm/InitState";
import {InputState} from "../../src/api/fsm/InputState";
import {OutputState} from "../../src/api/fsm/OutputState";
import {StdState} from "../../src/impl/fsm/StdState";
import {SubFSMTransition} from "../../src/impl/fsm/SubFSMTransition";
import {TerminalState} from "../../src/impl/fsm/TerminalState";
import {TimeoutTransition} from "../../src/impl/fsm/TimeoutTransition";
import {catFSM} from "../../src/api/logging/ConfigLog";
import {StubTransitionOK, SubStubTransition1, SubStubTransition2, SubStubTransition3} from "./StubTransitionOK";
import {FSMHandler} from "../../src/api/fsm/FSMHandler";
import {mock, MockProxy} from "jest-mock-extended";
import {createKeyEvent, createMouseEvent, createTouchEvent} from "../interaction/StubEvents";

let fsm: FSMImpl;
let handler: FSMHandler & MockProxy<FSMHandler>;

beforeEach(() => {
    jest.clearAllMocks();
    fsm = new FSMImpl();
    handler = mock<FSMHandler>();
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
    const evt = mock<Event>();
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
    jest.spyOn(catFSM, "info");
    fsm.onTimeout();
    expect(catFSM.info).not.toHaveBeenCalled();
});

test("that errors caught on start with an error", () => {
    jest.spyOn(catFSM, "error");
    handler.fsmStarts.mockImplementation(() => {
        throw new Error("crash provoked");
    });
    fsm.addHandler(handler);

    expect(() => {
        fsm.onStarting();
    }).not.toThrow();
    expect(catFSM.error).toHaveBeenCalledTimes(1);
});

test("that errors caught on start with not an error", () => {
    jest.spyOn(catFSM, "warn");
    handler.fsmStarts.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "42";
    });
    fsm.addHandler(handler);

    expect(() => {
        fsm.onStarting();
    }).not.toThrow();
    expect(catFSM.warn).toHaveBeenCalledTimes(1);
});

test("that errors caught on update with an error", () => {
    jest.spyOn(catFSM, "error");
    handler.fsmUpdates.mockImplementation(() => {
        throw new Error("crash provoked on update");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onUpdating();
    }).not.toThrow();
    expect(catFSM.error).toHaveBeenCalledTimes(1);
});

test("that errors caught on update with not an error", () => {
    jest.spyOn(catFSM, "warn");
    handler.fsmUpdates.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "err";
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onUpdating();
    }).not.toThrow();
    expect(catFSM.warn).toHaveBeenCalledTimes(1);
});

test("that errors caught on end with an error", () => {
    jest.spyOn(catFSM, "error");
    handler.fsmStops.mockImplementation(() => {
        throw new Error("crash provoked on end");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onTerminating();
    }).not.toThrow();
    expect(catFSM.error).toHaveBeenCalledTimes(1);
});

test("that errors caught on end with not an error", () => {
    jest.spyOn(catFSM, "warn");
    handler.fsmStops.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "foo";
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onTerminating();
    }).not.toThrow();
    expect(catFSM.warn).toHaveBeenCalledTimes(1);
});

test("that errors caught on cancel with an error", () => {
    jest.spyOn(catFSM, "error");
    handler.fsmCancels.mockImplementation(() => {
        throw new Error("crash provoked on cancel");
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onCancelling();
    }).not.toThrow();
    expect(catFSM.error).toHaveBeenCalledTimes(1);
});

test("that errors caught on cancel with not an error", () => {
    jest.spyOn(catFSM, "warn");
    handler.fsmCancels.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "yolo";
    });
    fsm.onStarting();
    fsm.addHandler(handler);

    expect(() => {
        fsm.onCancelling();
    }).not.toThrow();
    expect(catFSM.warn).toHaveBeenCalledTimes(1);
});


test("testUninstall", () => {
    const s1 = new StdState(fsm, "su");
    const subj = fsm.currentStateObservable() as unknown as Subject<[OutputState, OutputState]>;
    jest.spyOn(s1, "uninstall");
    jest.spyOn(subj, "complete");
    fsm.addState(s1);
    fsm.addRemaningEventsToProcess(mock<Event>());
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
        fsm.process(mock<Event>());
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testFire2EventsToEnd", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(fsm.getCurrentState()).toBe(fsm.initState);
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

        expect(fsm.getCurrentState()).toBe(std);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(fsm.getEventsToProcess()).toHaveLength(0);
    });

    test("testReinit", () => {
        fsm.process(mock<Event>());
        fsm.reinit();
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testFullReinit", () => {
        fsm.process(mock<Event>());
        fsm.addRemaningEventsToProcess(mock<Event>());
        fsm.fullReinit();
        expect(fsm.getEventsToProcess()).toHaveLength(0);
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testCancelOnStart", () => {
        handler.fsmStarts.mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(mock<Event>());
        expect(fsm.getCurrentState()).toBe(fsm.initState);
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
        expect(fsm.getCurrentState()).toBe(fsm.initState);
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
        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("testHasStartedReinit", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(fsm.isStarted()).toBeFalsy();
    });

    test("testHasStarted", () => {
        fsm.process(mock<Event>());
        expect(fsm.isStarted()).toBeTruthy();
    });
});

describe("testProcessUniqueEvent -- cancel", () => {
    let std: StdState;
    let cancelling: CancellingState;

    beforeEach(() => {
        handler = mock<FSMHandler>();
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
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("testNoRecycleEventOnCancel", () => {
        fsm.process(mock<Event>());
        fsm.addRemaningEventsToProcess(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
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
        fsm.process(mock<Event>());

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("testNotTriggeredIfNotGoodEvent", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());

        expect(fsm.getCurrentState()).toBe(std);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("testTriggerGoodChoice", () => {
        fsm.process(mock<Event>());
        fsm.process(createKeyEvent("keydown", "a"));

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("testHasStartedReinitOnCancel", () => {
        fsm.process(mock<Event>());
        fsm.process(createKeyEvent("keydown", "a"));

        expect(fsm.isStarted()).toBeFalsy();
    });

    test("testTriggerGoodChoice2", () => {
        fsm.process(mock<Event>());
        fsm.process(createMouseEvent("click", document.createElement("button")));

        expect(fsm.getCurrentState()).toBe(fsm.initState);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("check onstart not called when starting state diff", () => {
        fsm.setStartingState(terminal);
        fsm.process(mock<Event>());

        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("testStartingStateNotTriggeredSoNoUpdate", () => {
        fsm.setStartingState(terminal);
        fsm.process(mock<Event>());

        expect(handler.fsmUpdates).not.toHaveBeenCalled();
    });

    test("testStartingStateNotTriggeredSoNoCancel", () => {
        fsm.setStartingState(terminal);
        fsm.process(mock<Event>());
        fsm.process(createKeyEvent("keydown", "a"));

        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testStartingStateTriggeredOnTerminal", () => {
        fsm.setStartingState(terminal);
        fsm.process(mock<Event>());
        fsm.process(createMouseEvent("click", document.createElement("button")));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("testStartingStateOnRecursion", () => {
        fsm.setStartingState(std);
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
        fsm.process(mock<Event>());
        jest.runOnlyPendingTimers();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
        expect(fsm.getCurrentState()).toStrictEqual(std2);
    });

    test("testTimeoutStoppedOnOtherTransitionWithLog", () => {
        fsm.log(true);
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        jest.runOnlyPendingTimers();
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
    });

    test("testTimeoutStoppedOnOtherTransition", () => {
        fsm.process(mock<Event>());
        fsm.process(mock<Event>());
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
    });

    test("testTimeoutChangeStateThenCancel", () => {
        handler.fsmUpdates.mockImplementation(() => {
            throw new CancelFSMException();
        });
        fsm.process(mock<Event>());
        jest.runOnlyPendingTimers();
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
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

    test("testEntersSubGoodCurrState", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.getCurrentState()).toStrictEqual(subS1);
        expect(fsm.getCurrentState()).toStrictEqual(subS1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });

    test("testNextSubStarteChangesMainCurrState", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        expect(mainfsm.getCurrentState()).toStrictEqual(subS2);
        expect(fsm.getCurrentState()).toStrictEqual(subS2);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    });

    test("testEntersSubTerminalGoNextMain", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.getCurrentState()).toStrictEqual(s1);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("testEntersSubCancelCancelsMain", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createKeyEvent("keydown", "b"));
        expect(mainfsm.getCurrentState()).toStrictEqual(mainfsm.initState);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("testReinitAlsoSubFSM", () => {
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.fullReinit();
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
    });

    test("testExitSubGoIntoCancelling", () => {
        const cancel: CancellingState = new CancellingState(mainfsm, "cancel1");
        mainfsm.addState(cancel);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, cancel, fsm);
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
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

            public getFSM(): FSMImpl {
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
        expect(mainfsm.getCurrentState().getName()).toStrictEqual("sub2");
        expect(fsm.getCurrentState()).toBe(fsm.initState);
    });

    test("testExitSubGoIntoTerminal", () => {
        const terminal: TerminalState = new TerminalState(mainfsm, "terminal1");
        mainfsm.addState(terminal);
        mainfsm.initState.clearTransitions();
        new SubFSMTransition(mainfsm.initState, terminal, fsm);
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        mainfsm.process(createKeyEvent("keydown", "a"));
        mainfsm.process(createMouseEvent("click", document.createElement("button")));
        expect(mainfsm.getCurrentState()).toStrictEqual(mainfsm.initState);
        expect(fsm.getCurrentState()).toStrictEqual(fsm.initState);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });
});
