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

import {State} from "../../api/fsm/State";
import {InitState} from "./InitState";
import {OutputState} from "../../api/fsm/OutputState";
import {FSMHandler} from "../../api/fsm/FSMHandler";
import {TimeoutTransition} from "./TimeoutTransition";
import {InputState} from "../../api/fsm/InputState";
import {OutputStateBase} from "./OutputStateBase";
import {catFSM} from "../../api/logging/ConfigLog";
import {FSMDataHandler} from "./FSMDataHandler";
import {isKeyDownEvent, isKeyUpEvent} from "./Events";
import {Observable, Subject} from "rxjs";
import {remove, removeAt} from "../util/ArrayUtil";
import {Category} from "typescript-logging";
import {CancelFSMException} from "./CancelFSMException";
import {FSM} from "../../api/fsm/FSM";

/**
 * A finite state machine that defines the behavior of a user interaction.
 */
export class FSMImpl implements FSM {
    private static readonly exLog = new Category("FSM Exception");

    protected dataHandler?: FSMDataHandler;

    protected asLogFSM: boolean;

    protected _inner: boolean;

    /**
     * By default an FSM triggers its 'start' event when it leaves its initial state.
     * In some cases, this is not the case. For example, a double-click interaction is an FSM that must trigger
     * its start event when the FSM reaches... its terminal state. Similarly, a DnD must trigger its start event
     * on the first move, not on the first press.
     * The goal of this attribute is to identify the state of the FSM that must trigger the start event.
     * By default, this attribute is set with the initial state of the FSM.
     */
    protected _startingState: State;

    /**
     * Goes with 'startingState'. It permits to know whether the FSM has started, ie whether the 'starting state'
     * has been reached.
     */
    protected started: boolean;

    public readonly initState: InitState;

    protected _currentState: OutputState;

    protected readonly currentStatePublisher: Subject<[OutputState, OutputState]>;

    /**
     * The tes that compose the finite state machine.
     */
    protected readonly states: Array<State>;

    /**
     * The handler that want to be notified when the state machine of the interaction changed.
     */
    protected readonly handlers: Array<FSMHandler>;

    /**
     * The events still in process. For example when the user press key ctrl and scroll one time using
     * the wheel of the mouse, the interaction scrolling is
     * finished but the event keyPressed 'ctrl' is still in process. At the end of the interaction, these events
     * are re-introduced into the
     * state machine of the interaction for processing.
     */
    protected readonly eventsToProcess: Array<Event>;

    /**
     * The current timeout in progress.
     */
    protected currentTimeout?: TimeoutTransition;

    protected currentSubFSM?: FSM;

    /**
     * Creates the FSM.
     */
    public constructor() {
        this._inner = false;
        this.started = false;
        this.initState = new InitState(this, "init");
        this.states = new Array<State>(this.initState);
        this._startingState = this.initState;
        this._currentState = this.initState;
        this.currentStatePublisher = new Subject();
        this.handlers = [];
        this.eventsToProcess = [];
        this.asLogFSM = false;
    }

    protected buildFSM(dataHandler?: FSMDataHandler): void {
        if (this.states.length > 1) {
            return;
        }

        this.dataHandler = dataHandler;
    }

    public setCurrentSubFSM(subFSM?: FSM): void {
        this.currentSubFSM = subFSM;
    }

    public getCurrentState(): OutputState {
        return this._currentState;
    }

    public currentStateObservable(): Observable<[OutputState, OutputState]> {
        return this.currentStatePublisher;
    }

    public setInner(inner: boolean): void {
        this._inner = inner;
    }

    public getInner(): boolean {
        return this._inner;
    }

    public process(event: Event): boolean {
        // Removing the possible corresponding and pending key pressed event
        if (isKeyUpEvent(event)) {
            this.removeKeyEvent(event.code);
        }

        // Processing the event
        const processed: boolean = this.processEvent(event);

        // Recycling events
        if (processed && isKeyDownEvent(event) && !(this._currentState instanceof InitState) &&
            this.eventsToProcess.find(evt => isKeyDownEvent(evt) && evt.code === event.code) === undefined) {
            this.addRemaningEventsToProcess(event);
        }

        return processed;
    }

    private processEvent(event: Event): boolean {
        if (this.currentSubFSM !== undefined) {
            if (this.asLogFSM) {
                catFSM.info(`processing event ${String(event.type)} in a sub-FSM`);
            }
            return this.currentSubFSM.process(event);
        }
        if (this.asLogFSM) {
            catFSM.info(`processing event ${String(event.type)} at state ${this.getCurrentState().getName()}: ${this.constructor.name}`);
        }
        return this.getCurrentState().process(event);
    }


    public getDataHandler(): FSMDataHandler | undefined {
        return this.dataHandler;
    }

    /**
     * Removes the given KeyPress event from the events 'still in process' list.
     * @param key The key code of the event to remove.
     */
    private removeKeyEvent(key: string): void {
        let removed = false;

        for (let i = 0, size = this.eventsToProcess.length; i < size && !removed; i++) {
            const event = this.eventsToProcess[i];

            if (event instanceof KeyboardEvent && event.code === key) {
                removed = true;
                removeAt(this.eventsToProcess, i);
            }
        }
    }

    public enterStdState(state: OutputState & InputState): void {
        this.setCurrentState(state);
        this.checkTimeoutTransition();
        if (this.started) {
            this.onUpdating();
        }
    }

    public isStarted(): boolean {
        return this.started;
    }

    public setCurrentState(state: OutputState): void {
        const old = this.getCurrentState();
        this._currentState = state;
        this.currentStatePublisher.next([old, this._currentState]);
    }

    /**
     * The end of the FSM execution, the events still (eg keyPress) in process must be recycled to be reused in the FSM.
     */
    protected processRemainingEvents(): void {
        const list: Array<Event> = [...this.eventsToProcess];

        list.forEach(event => {
            removeAt(this.eventsToProcess, 0);
            if (this.asLogFSM) {
                catFSM.info(`Recycling event: ${event.constructor.name}`);
            }
            this.process(event);
        });
    }

    public addRemaningEventsToProcess(event: Event): void {
        this.eventsToProcess.push(event);
    }

    /**
     * Terminates the state machine.
     */
    public onTerminating(): void {
        if (this.asLogFSM) {
            catFSM.info(`FSM ended: ${this.constructor.name}`);
        }
        if (this.started) {
            this.notifyHandlerOnStop();
        }
        this.reinit();
        this.processRemainingEvents();
    }

    public onCancelling(): void {
        if (this.asLogFSM) {
            catFSM.info(`FSM cancelled: ${this.constructor.name}`);
        }
        if (this.started) {
            this.notifyHandlerOnCancel();
        }
        this.fullReinit();
    }

    public onStarting(): void {
        if (this.asLogFSM) {
            catFSM.info(`FSM started: ${this.constructor.name}`);
        }
        this.started = true;
        this.notifyHandlerOnStart();
    }

    /**
     * Updates the state machine.
     */
    public onUpdating(): void {
        if (this.started) {
            if (this.asLogFSM) {
                catFSM.info(`FSM updated: ${this.constructor.name}`);
            }
            this.notifyHandlerOnUpdate();
        }
    }

    /**
     * Adds a state to the state machine.
     * @param state The state to add. Must not be null.
     */
    public addState(state: InputState): void {
        this.states.push(state);
    }

    public log(log: boolean): void {
        this.asLogFSM = log;
    }

    public reinit(): void {
        if (this.asLogFSM) {
            catFSM.info(`FSM reinitialised: ${this.constructor.name}`);
        }
        if (this.currentTimeout !== undefined) {
            this.currentTimeout.stopTimeout();
        }
        this.started = false;
        this.setCurrentState(this.initState);
        this.currentTimeout = undefined;

        if (this.currentSubFSM !== undefined) {
            this.currentSubFSM.reinit();
        }

        if (this.dataHandler !== undefined && !this._inner) {
            this.dataHandler.reinitData();
        }
    }

    public fullReinit(): void {
        this.eventsToProcess.length = 0;
        this.reinit();
        if (this.currentSubFSM !== undefined) {
            this.currentSubFSM.fullReinit();
        }
    }

    public onTimeout(): void {
        if (this.currentTimeout !== undefined) {
            if (this.asLogFSM) {
                catFSM.info(`Timeout: ${this.constructor.name}`);
            }
            const state = this.currentTimeout.execute();
            if (state instanceof OutputStateBase) {
                this.setCurrentState(state);
                this.checkTimeoutTransition();
            }
        }
    }

    public stopCurrentTimeout(): void {
        if (this.currentTimeout !== undefined) {
            if (this.asLogFSM) {
                catFSM.info(`Timeout stopped: ${this.constructor.name}`);
            }
            this.currentTimeout.stopTimeout();
            this.currentTimeout = undefined;
        }
    }

    /**
     * Checks whether the current state has a timeout transition.
     * If it is the case, the timeout transition is launched.
     */
    protected checkTimeoutTransition(): void {
        const tr = this.getCurrentState().getTransitions()
            .find(t => t instanceof TimeoutTransition) as TimeoutTransition | undefined;

        if (tr !== undefined) {
            if (this.asLogFSM) {
                catFSM.info(`Timeout starting: ${this.constructor.name}`);
            }
            this.currentTimeout = tr;
            this.currentTimeout.startTimeout();
        }
    }

    public addHandler(handler: FSMHandler): void {
        this.handlers.push(handler);
    }

    public removeHandler(handler: FSMHandler): void {
        remove(this.handlers, handler);
    }

    /**
     * Notifies handler that the interaction starts.
     */
    protected notifyHandlerOnStart(): void {
        try {
            this.handlers.forEach(handler => handler.fsmStarts());
        } catch (ex) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (ex.constructor !== CancelFSMException) {
                FSMImpl.exLog.error("crash in notifyHandlerOnStart", ex);
            }
            this.onCancelling();
            throw ex;
        }
    }

    /**
     * Notifies handler that the interaction updates.
     */
    protected notifyHandlerOnUpdate(): void {
        try {
            this.handlers.forEach(handler => handler.fsmUpdates());
        } catch (ex) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (ex.constructor !== CancelFSMException) {
                FSMImpl.exLog.error("crash in notifyHandlerOnUpdate", ex);
            }
            this.onCancelling();
            throw ex;
        }
    }

    /**
     * Notifies handler that the interaction stops.
     */
    public notifyHandlerOnStop(): void {
        try {
            [...this.handlers].forEach(handler => handler.fsmStops());
        } catch (ex) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (ex.constructor !== CancelFSMException) {
                FSMImpl.exLog.error("crash in notifyHandlerOnStop", ex);
            }
            this.onCancelling();
            throw ex;
        }
    }

    /**
     * Notifies handler that the interaction is cancelled.
     */
    protected notifyHandlerOnCancel(): void {
        [...this.handlers].forEach(handler => handler.fsmCancels());
    }

    public getStates(): Array<State> {
        return [...this.states];
    }

    public getStartingState(): State {
        return this._startingState;
    }

    public setStartingState(state: State): void {
        this._startingState = state;
    }

    public getEventsToProcess(): Array<Event> {
        return [...this.eventsToProcess];
    }

    public getInitState(): OutputState {
        return this.initState;
    }

    public uninstall(): void {
        this.fullReinit();
        this.asLogFSM = false;
        this.currentStatePublisher.complete();
        this.currentSubFSM = undefined;
        this.states.forEach(state => state.uninstall());
        this.states.length = 0;
        this.dataHandler = undefined;
    }
}
