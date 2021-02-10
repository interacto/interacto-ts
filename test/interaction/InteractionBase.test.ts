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
import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {InitState} from "../../src/impl/fsm/InitState";
import {OutputState} from "../../src/api/fsm/OutputState";
import {StdState} from "../../src/impl/fsm/StdState";
import {InteractionStub} from "./InteractionStub";
import {mock, MockProxy} from "jest-mock-extended";
import {flushPromises} from "../Utils";
import {createMouseEvent, MouseEventForTest} from "./StubEvents";
import {catInteraction} from "../../src/api/logging/ConfigLog";
import advanceTimersByTime = jest.advanceTimersByTime;
import runAllTimers = jest.runAllTimers;
import clearAllTimers = jest.clearAllTimers;

let interaction: InteractionStub;
let fsm: FSMImpl & MockProxy<FSMImpl>;
let currentStateObs: Subject<[OutputState, OutputState]>;
let currentState: OutputState;

beforeEach(() => {
    currentStateObs = new Subject();
    fsm = mock<FSMImpl>();
    fsm.currentStateObservable.mockReturnValue(currentStateObs);
    fsm.getCurrentState.mockImplementation(() => currentState);
    interaction = new InteractionStub(fsm);
});

afterEach(() => {
    interaction.uninstall();
    currentStateObs.complete();
});


test("full reinit", () => {
    interaction.fullReinit();
    expect(fsm.fullReinit).toHaveBeenCalledTimes(1);
});

test("is running not activated", () => {
    interaction.setActivated(false);
    expect(interaction.isRunning()).toBeFalsy();
});

test("is running init state", () => {
    interaction.setActivated(true);
    currentState = new InitState(fsm, "s");
    expect(interaction.isRunning()).toBeFalsy();
});

test("is running OK", () => {
    interaction.setActivated(true);
    currentState = new StdState(fsm, "s");
    expect(interaction.isRunning()).toBeTruthy();
});

test("activated by default", () => {
    expect(interaction.isActivated()).toBeTruthy();
});

test("set not activated", () => {
    interaction.setActivated(false);
    expect(interaction.isActivated()).toBeFalsy();
});

test("set reactivated", () => {
    interaction.setActivated(false);
    interaction.setActivated(true);
    expect(interaction.isActivated()).toBeTruthy();
});

test("not process when not activated", () => {
    const evt = {} as Event;
    interaction.setActivated(false);
    interaction.processEvent(evt);
    expect(fsm.process).not.toHaveBeenCalledWith();
});

test("getFSM", () => {
    expect(interaction.getFsm()).toBe(fsm);
});

test("reinit", () => {
    jest.spyOn(interaction, "reinitData");
    interaction.reinit();
    expect(interaction.reinitData).toHaveBeenCalledTimes(1);
    expect(fsm.reinit).toHaveBeenCalledTimes(1);
});

test("uninstall", () => {
    jest.spyOn(interaction, "updateEventsRegistered");
    interaction.uninstall();
    currentStateObs.next([{} as OutputState, {} as OutputState]);
    expect(interaction.isActivated()).toBeFalsy();
    expect(interaction.updateEventsRegistered).not.toHaveBeenCalledWith();
});

test("currentState", () => {
    const s1 = {} as OutputState;
    const s2 = {} as OutputState;
    jest.spyOn(interaction, "updateEventsRegistered");
    currentStateObs.next([s1, s2]);
    expect(interaction.updateEventsRegistered).toHaveBeenCalledWith(s1, s2);
});

test("register to node children", async () => {
    expect.assertions(1);

    interaction = new InteractionStub(new FSMImpl());
    const doc = document.createElement("svg");

    jest.spyOn(interaction, "onNewNodeRegistered");

    interaction.registerToNodeChildren(doc);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("id", "rect");
    doc.appendChild(rect);

    // Waiting for the mutation changes to be done.
    await flushPromises();
    expect(interaction.onNewNodeRegistered).toHaveBeenCalledTimes(1);
});

describe("throttling", () => {
    let elt: HTMLDivElement;
    let evt1: MouseEventForTest;
    let evt2: MouseEventForTest;
    let evt3: MouseEventForTest;
    let evt4: MouseEventForTest;
    let evtDiff: MouseEventForTest;

    beforeEach(() => {
        jest.useFakeTimers();
        elt = document.createElement("div");
        evt1 = createMouseEvent("mousemove", elt, 1, 2) as MouseEventForTest;
        evt2 = createMouseEvent("mousemove", elt, 3, 4) as MouseEventForTest;
        evt3 = createMouseEvent("mousemove", elt, 5, 6) as MouseEventForTest;
        evt4 = createMouseEvent("mousemove", elt, 7, 8) as MouseEventForTest;
        evtDiff = createMouseEvent("mouseup", elt, 1, 2) as MouseEventForTest;
        evt1.id = 1;
        evt2.id = 2;
        evt3.id = 3;
        evt4.id = 4;
        evtDiff.id = 5;
        interaction.setThrottleTimeout(10);
    });

    afterEach(async () => {
        clearAllTimers();
        await flushPromises();
    });


    test("throttle with a single event > timeout", async() => {
        interaction.processEvent(evt1);
        // jest.advanceTimersByTime(10);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
        expect(fsm.process).toHaveBeenCalledTimes(1);
    });

    test("throttle with a single event < timeout", async() => {
        interaction.processEvent(evt1);
        jest.advanceTimersByTime(9);
        await flushPromises();

        expect(fsm.process).toHaveBeenCalledTimes(0);
    });

    test("throttle with two events of same type < timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evt2);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt2);
        expect(fsm.process).toHaveBeenCalledTimes(1);
    });

    test("throttle with three events of same type < timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evt2);
        advanceTimersByTime(7);
        interaction.processEvent(evt3);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt3);
        expect(fsm.process).toHaveBeenCalledTimes(1);
    });

    test("throttle with four events of same type < timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evt2);
        advanceTimersByTime(3);
        interaction.processEvent(evt3);
        advanceTimersByTime(1);
        interaction.processEvent(evt4);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt4);
        expect(fsm.process).toHaveBeenCalledTimes(1);
    });

    test("throttle with two events of same type > timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(11);
        interaction.processEvent(evt2);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenCalledTimes(2);
        expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt2);
    });

    test("throttle with three events of same type > timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(9);
        interaction.processEvent(evt2);
        advanceTimersByTime(15);
        interaction.processEvent(evt3);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt2);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt3);
        expect(fsm.process).toHaveBeenCalledTimes(2);
    });

    test("throttle with four events of same type > timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(9);
        interaction.processEvent(evt2);
        advanceTimersByTime(15);
        interaction.processEvent(evt3);
        advanceTimersByTime(10);
        interaction.processEvent(evt4);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt2);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt3);
        expect(fsm.process).toHaveBeenNthCalledWith(3, evt4);
        expect(fsm.process).toHaveBeenCalledTimes(3);
    });

    test("throttle with two events of different types < timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evtDiff);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evtDiff);
        expect(fsm.process).toHaveBeenCalledTimes(2);
    });

    test("throttle with three + one events of different types < timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evt2);
        advanceTimersByTime(2);
        interaction.processEvent(evt3);
        advanceTimersByTime(2);
        interaction.processEvent(evtDiff);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt3);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evtDiff);
        expect(fsm.process).toHaveBeenCalledTimes(2);
    });

    test("throttle with one + three events of different types < timeout", async() => {
        interaction.processEvent(evtDiff);
        advanceTimersByTime(2);
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evt2);
        advanceTimersByTime(2);
        interaction.processEvent(evt3);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evtDiff);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt3);
        expect(fsm.process).toHaveBeenCalledTimes(2);
    });

    test("throttle with one + three events of different types > timeout", async() => {
        interaction.processEvent(evt1);
        advanceTimersByTime(12);
        interaction.processEvent(evt2);
        advanceTimersByTime(5);
        interaction.processEvent(evt3);
        runAllTimers();
        await flushPromises();

        expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt3);
        expect(fsm.process).toHaveBeenCalledTimes(2);
    });

    test("crash with Error during throttling", async () => {
        jest.spyOn(catInteraction, "error");
        const spy = jest.spyOn(interaction.getFsm(), "process");
        spy
            .mockReturnValueOnce(true)
            .mockImplementationOnce(() => {
                throw new Error("YOLO");
            });
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evtDiff);
        runAllTimers();
        await flushPromises();
        expect(catInteraction.error).toHaveBeenCalledTimes(1);
    });

    test("crash with not an Error during throttling", async () => {
        jest.spyOn(catInteraction, "warn");
        const spy = jest.spyOn(interaction.getFsm(), "process");
        spy
            .mockReturnValueOnce(true)
            .mockImplementationOnce(() => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw 42;
            });
        interaction.processEvent(evt1);
        advanceTimersByTime(2);
        interaction.processEvent(evtDiff);
        runAllTimers();
        await flushPromises();
        expect(catInteraction.warn).toHaveBeenCalledTimes(1);
    });
});
