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
import type {FSMHandler, Logger, OutputState, FSMDataHandler,
    CancellingState,
    TerminalState} from "../../src/interacto";
import {
    CancelFSMError,
    FSMImpl,
    InitState,
    StdState,
    SubFSMTransition,
    TimeoutTransition
} from "../../src/interacto";
import {StubTransitionOK, SubStubTransition1, SubStubTransition2, SubStubTransition3} from "./StubTransitionOk";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {createKeyEvent, createMouseEvent, createTouchEvent} from "../interaction/StubEvents";

let fsm: FSMImpl<FSMDataHandler>;
let handler: FSMHandler & MockProxy<FSMHandler>;
let logger: Logger;

describe("using an FSM", () => {
    beforeEach(() => {
        logger = mock<Logger>();
        jest.clearAllMocks();
        fsm = new FSMImpl(logger);
        handler = mock<FSMHandler>();
    });

    test("initState", () => {
        expect(fsm.states).toHaveLength(1);
        expect(fsm.states[0]).toBeInstanceOf(InitState);
    });

    test("get init state", () => {
        expect(fsm.initState).toBeInstanceOf(InitState);
        expect(fsm.initState).toBe(fsm.states[0]);
    });

    test("inner", () => {
        expect(fsm.inner).toBeFalsy();
    });

    test("startingState", () => {
        expect(fsm.startingState).toStrictEqual(fsm.initState);
    });

    test("currentStateAtStart", () => {
        expect(fsm.currentState).toStrictEqual(fsm.initState);
    });

    test("add standard state", () => {
        fsm.addStdState("s1");
        expect(fsm.states).toHaveLength(2);
    });

    test("addRemainingNotNull", () => {
        const evt = mock<Event>();
        fsm.addRemaningEventsToProcess(evt);
        expect(fsm.getEventsToProcess()).toStrictEqual([evt]);
    });

    test("isInner", () => {
        expect(fsm.inner).toBeFalsy();
    });

    test("setInnerTrue", () => {
        fsm.inner = true;
        expect(fsm.inner).toBeTruthy();
    });

    test("setInnerFalse", () => {
        fsm.inner = true;
        fsm.inner = false;
        expect(fsm.inner).toBeFalsy();
    });

    test("processRemainingEvents", () => {
        const evt = mock<Event>();
        fsm.addRemaningEventsToProcess(evt);
        fsm.onTerminating();
        expect(fsm.getEventsToProcess()).toHaveLength(0);
    });

    test("onTerminatingIfStarted", () => {
        fsm.onStarting();
        fsm.addHandler(handler);
        fsm.onTerminating();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("onTerminatingNotStarted", () => {
        fsm.addHandler(handler);
        fsm.onTerminating();
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("onUpdatingIfStarted", () => {
        fsm.onStarting();
        fsm.addHandler(handler);
        fsm.onUpdating();
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("onUpdatingNotStarted", () => {
        fsm.addHandler(handler);
        fsm.onUpdating();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
    });

    test("onTimeoutWithoutTimeout", () => {
        fsm.onTimeout();
        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("that errors caught on start with an error", () => {
        handler.fsmStarts = jest.fn(() => {
            throw new Error("crash provoked");
        });
        fsm.addHandler(handler);

        expect(() => {
            fsm.onStarting();
        }).toThrow(new Error("crash provoked"));
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on start with an error with no logger", () => {
        fsm = new FSMImpl(logger);
        handler.fsmStarts = jest.fn(() => {
            throw new Error("crash provoked2");
        });
        fsm.addHandler(handler);

        expect(() => {
            fsm.onStarting();
        }).toThrow(new Error("crash provoked2"));
    });

    test("that errors caught on start with not an error", () => {
        handler.fsmStarts = jest.fn(() => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw "42";
        });
        fsm.addHandler(handler);

        expect(() => {
            fsm.onStarting();
        }).toThrow("42");
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on update with an error", () => {
        handler.fsmUpdates = jest.fn(() => {
            throw new Error("crash provoked on update");
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onUpdating();
        }).toThrow(new Error("crash provoked on update"));
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on update with an error with no logger", () => {
        fsm = new FSMImpl(logger);
        handler.fsmUpdates = jest.fn(() => {
            throw new Error("crash provoked on update2");
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onUpdating();
        }).toThrow(new Error("crash provoked on update2"));
    });

    test("that errors caught on update with not an error", () => {
        handler.fsmUpdates = jest.fn(() => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw "err";
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onUpdating();
        }).toThrow("err");
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on end with an error", () => {
        handler.fsmStops = jest.fn(() => {
            throw new Error("crash provoked on end");
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onTerminating();
        }).toThrow(new Error("crash provoked on end"));
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on end with an error with no logger", () => {
        fsm = new FSMImpl(logger);
        handler.fsmStops = jest.fn(() => {
            throw new Error("crash provoked on end");
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onTerminating();
        }).toThrow(new Error("crash provoked on end"));
    });

    test("that errors caught on end with not an error", () => {
        handler.fsmStops = jest.fn(() => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw "foo";
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onTerminating();
        }).toThrow("foo");
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on cancel with an error", () => {
        handler.fsmCancels = jest.fn(() => {
            throw new Error("crash provoked on cancel");
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onCancelling();
        }).toThrow(new Error("crash provoked on cancel"));
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("that errors caught on cancel with an error with no logger", () => {
        fsm = new FSMImpl(logger);
        handler.fsmCancels = jest.fn(() => {
            throw new Error("crash provoked on cancel");
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onCancelling();
        }).toThrow(new Error("crash provoked on cancel"));
    });

    test("that errors caught on cancel with not an error", () => {
        handler.fsmCancels = jest.fn(() => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw "yolo";
        });
        fsm.onStarting();
        fsm.addHandler(handler);

        expect(() => {
            fsm.onCancelling();
        }).toThrow("yolo");
        expect(logger.logInteractionErr).toHaveBeenCalledTimes(1);
    });

    test("uninstall", () => {
        const s1 = fsm.addStdState("su");
        const subj = fsm.currentStateObservable as unknown as Subject<[OutputState, OutputState]>;
        jest.spyOn(s1, "uninstall");
        jest.spyOn(subj, "complete");
        fsm.addRemaningEventsToProcess(mock<Event>());
        fsm.uninstall();

        expect(fsm.states).toHaveLength(0);
        expect(fsm.getEventsToProcess()).toHaveLength(0);
        expect(subj.complete).toHaveBeenCalledTimes(1);
        expect(s1.uninstall).toHaveBeenCalledTimes(1);
    });

    test("currentState Changed", () => {
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
            std = fsm.addStdState("s1");
            terminal = fsm.addTerminalState("t1");
            new StubTransitionOK(fsm.initState, std);
            new StubTransitionOK(std, terminal);
        });

        test("getStates", () => {
            expect(fsm.states).toStrictEqual([fsm.initState, std, terminal]);
        });

        test("fireEventTriggerFSMStartUpdate", () => {
            fsm.process(mock<Event>());
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("fire2EventsToEnd", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            expect(fsm.currentState).toBe(fsm.initState);
        });

        test("fireEventTriggerFSMUpdate", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("fireThreeEventRestartOK", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        });

        test("recycleEvent", () => {
            fsm.process(mock<Event>());
            fsm.addRemaningEventsToProcess(mock<Event>());
            fsm.process(mock<Event>());

            expect(fsm.currentState).toBe(std);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
            expect(fsm.getEventsToProcess()).toHaveLength(0);
        });

        test("reinit", () => {
            fsm.process(mock<Event>());
            fsm.reinit();
            expect(fsm.currentState).toBe(fsm.initState);
        });

        test("fullReinit", () => {
            fsm.process(mock<Event>());
            fsm.addRemaningEventsToProcess(mock<Event>());
            fsm.fullReinit();
            expect(fsm.getEventsToProcess()).toHaveLength(0);
            expect(fsm.currentState).toBe(fsm.initState);
        });

        test("cancelOnStart", () => {
            handler.fsmStarts = jest.fn(() => {
                throw new CancelFSMError();
            });
            fsm.process(mock<Event>());
            expect(fsm.currentState).toBe(fsm.initState);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmUpdates).not.toHaveBeenCalled();
        });

        test("cancelOnUpdate", () => {
            handler.fsmUpdates = jest.fn(() => {
                throw new CancelFSMError();
            });
            fsm.process(mock<Event>());
            expect(fsm.currentState).toBe(fsm.initState);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("cancelOnEnd", () => {
            handler.fsmStops = jest.fn(() => {
                throw new CancelFSMError();
            });
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            expect(fsm.currentState).toBe(fsm.initState);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("hasStartedReinit", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            expect(fsm.started).toBeFalsy();
        });

        test("hasStarted", () => {
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
            std = fsm.addStdState("s1");
            cancelling = fsm.addCancellingState("c1");
            new StubTransitionOK(fsm.initState, std);
            new StubTransitionOK(std, cancelling);
        });

        test("cancellation", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());

            expect(fsm.currentState).toBe(fsm.initState);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("noRecycleEventOnCancel", () => {
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
            std = fsm.addStdState("s1");
            terminal = fsm.addTerminalState("t1");
            cancel = fsm.addCancellingState("c1");
            iToS = new StubTransitionOK(fsm.initState, std);
            new SubStubTransition1(std, terminal, true);
            new SubStubTransition2(std, cancel, true);
            new SubStubTransition3(std, std, true);
        });

        test("notTriggeredIfGuardKO", () => {
            iToS._guard = false;
            fsm.process(mock<Event>());

            expect(fsm.currentState).toBe(fsm.initState);
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("notTriggeredIfNotGoodEvent", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());

            expect(fsm.currentState).toBe(std);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        });

        test("triggerGoodChoice", () => {
            fsm.process(mock<Event>());
            fsm.process(createKeyEvent("keydown", "a"));

            expect(fsm.currentState).toBe(fsm.initState);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        });

        test("hasStartedReinitOnCancel", () => {
            fsm.process(mock<Event>());
            fsm.process(createKeyEvent("keydown", "a"));

            expect(fsm.started).toBeFalsy();
        });

        test("triggerGoodChoice2", () => {
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

        test("startingStateNotTriggeredSoNoUpdate", () => {
            fsm.startingState = terminal;
            fsm.process(mock<Event>());

            expect(handler.fsmUpdates).not.toHaveBeenCalled();
        });

        test("startingStateNotTriggeredSoNoCancel", () => {
            fsm.startingState = terminal;
            fsm.process(mock<Event>());
            fsm.process(createKeyEvent("keydown", "a"));

            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("startingStateTriggeredOnTerminal", () => {
            fsm.startingState = terminal;
            fsm.process(mock<Event>());
            fsm.process(createMouseEvent("click", document.createElement("button")));

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("startingStateOnRecursion", () => {
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
            std = fsm.addStdState("std");
            std2 = fsm.addStdState("std2");
            terminal = fsm.addTerminalState("terminal");
            new StubTransitionOK(fsm.initState, std);
            new StubTransitionOK(std, terminal);
            new TimeoutTransition(std, std2, () => 100);
            new StubTransitionOK(std2, std);
        });

        test("timeoutChangeState", () => {
            fsm.log = true;
            fsm.process(mock<Event>());
            jest.runOnlyPendingTimers();
            expect(fsm.currentState).toStrictEqual(std2);
        });

        test("timeoutStoppedOnOtherTransitionWithLog", () => {
            fsm.log = true;
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            jest.runOnlyPendingTimers();
            expect(fsm.currentState).toStrictEqual(fsm.initState);
        });

        test("timeoutStoppedOnOtherTransition", () => {
            fsm.process(mock<Event>());
            fsm.process(mock<Event>());
            expect(fsm.currentState).toStrictEqual(fsm.initState);
        });

        test("timeoutChangeStateThenCancel", () => {
            handler.fsmUpdates = jest.fn(() => {
                throw new CancelFSMError();
            });
            fsm.process(mock<Event>());
            jest.runOnlyPendingTimers();
            expect(fsm.currentState).toStrictEqual(fsm.initState);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });

    describe("testWithSubFSM", () => {
        let mainfsm: FSMImpl<FSMDataHandler>;
        let s1: StdState;
        let subS1: StdState;
        let subS2: StdState;
        let subT: TerminalState;
        let subC: CancellingState;

        beforeEach(() => {
            jest.clearAllMocks();
            fsm = new FSMImpl(logger);
            mainfsm = new FSMImpl(logger);
            s1 = mainfsm.addStdState("s1");
            new SubFSMTransition(mainfsm.initState, s1, fsm);
            mainfsm.addHandler(handler);
            subS1 = fsm.addStdState("subS1");
            subS2 = fsm.addStdState("subS2");
            subT = fsm.addTerminalState("subT");
            subC = fsm.addCancellingState("subC");
            new SubStubTransition1(fsm.initState, subS1, true);
            new SubStubTransition2(subS1, subS2, true);
            new SubStubTransition1(subS2, subT, true);
            new SubStubTransition2(subS2, subC, true);
        });

        test("check log when processing event with sub FSM", () => {
            fsm = new FSMImpl(logger);
            mainfsm = new FSMImpl(logger);
            s1 = mainfsm.addStdState("s1");
            new SubFSMTransition(mainfsm.initState, s1, fsm);
            subS1 = fsm.addStdState("subS1");
            subS2 = fsm.addStdState("subS2");
            subT = fsm.addTerminalState("subT");
            subC = fsm.addCancellingState("subC");
            new SubStubTransition1(fsm.initState, subS1, true);
            new SubStubTransition2(subS1, subS2, true);
            new SubStubTransition1(subS2, subT, true);
            new SubStubTransition2(subS2, subC, true);
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
            s1 = mainfsm.addStdState("s1");
            new SubFSMTransition(mainfsm.initState, s1, fsm);
            fsm.log = false;
            mainfsm.log = false;
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            mainfsm.process(createKeyEvent("keydown", "a"));
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
        });

        test("entersSubGoodCurrState", () => {
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            expect(mainfsm.currentState).toStrictEqual(subS1);
            expect(fsm.currentState).toStrictEqual(subS1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });

        test("nextSubStarteChangesMainCurrState", () => {
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            mainfsm.process(createKeyEvent("keydown", "a"));
            expect(mainfsm.currentState).toStrictEqual(subS2);
            expect(fsm.currentState).toStrictEqual(subS2);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        });

        test("entersSubTerminalGoNextMain", () => {
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            mainfsm.process(createKeyEvent("keydown", "a"));
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            expect(mainfsm.currentState).toStrictEqual(s1);
            expect(fsm.currentState).toStrictEqual(fsm.initState);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("entersSubCancelCancelsMain", () => {
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            mainfsm.process(createKeyEvent("keydown", "a"));
            mainfsm.process(createKeyEvent("keydown", "b"));
            expect(mainfsm.currentState).toStrictEqual(mainfsm.initState);
            expect(fsm.currentState).toStrictEqual(fsm.initState);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("reinitAlsoSubFSM", () => {
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            mainfsm.process(createKeyEvent("keydown", "a"));
            mainfsm.fullReinit();
            expect(fsm.currentState).toStrictEqual(fsm.initState);
        });

        test("exitSubGoIntoCancelling", () => {
            const cancel = mainfsm.addCancellingState("cancel");
            mainfsm.initState.clearTransitions();
            new SubFSMTransition(mainfsm.initState, cancel, fsm);
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            mainfsm.process(createKeyEvent("keydown", "a"));
            mainfsm.process(createMouseEvent("click", document.createElement("button")));
            expect(mainfsm.currentState).toStrictEqual(mainfsm.initState);
            expect(fsm.currentState).toStrictEqual(fsm.initState);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("exitSubGoIntoTerminal", () => {
            const terminal = mainfsm.addTerminalState("terminal");
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
});
