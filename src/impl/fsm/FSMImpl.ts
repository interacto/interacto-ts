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

import type {State} from "../../api/fsm/State";
import {InitState} from "./InitState";
import type {OutputState} from "../../api/fsm/OutputState";
import {isOutputStateType} from "../../api/fsm/OutputState";
import type {FSMHandler} from "../../api/fsm/FSMHandler";
import {TimeoutTransition} from "./TimeoutTransition";
import type {InputState} from "../../api/fsm/InputState";
import type {FSMDataHandler} from "./FSMDataHandler";
import {isKeyDownEvent, isKeyUpEvent} from "./Events";
import type {Observable} from "rxjs";
import {Subject} from "rxjs";
import {remove, removeAt} from "../util/ArrayUtil";
import {CancelFSMException} from "./CancelFSMException";
import type {FSM} from "../../api/fsm/FSM";
import type {Logger} from "../../api/logging/Logger";

/**
 * A finite state machine that defines the behavior of a user interaction.
 */
export class FSMImpl implements FSM {
    protected dataHandler?: FSMDataHandler;

    protected readonly logger?: Logger;

    public _log: boolean;

    public inner: boolean;

    public startingState: State;

    /**
     * Goes with 'startingState'. It permits to know whether the FSM has started, ie whether the 'starting state'
     * has been reached.
     */
    protected _started: boolean;

    public readonly initState: InitState;

    protected _currentState: OutputState;

    protected readonly currentStatePublisher: Subject<[OutputState, OutputState]>;

    /**
     * The states that compose the finite state machine.
     */
    protected readonly _states: Array<State>;

    /**
     * The handlers to be notified on FSM state changes.
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

    public currentSubFSM: FSM | undefined;

    /**
     * Creates the FSM.
     */
    public constructor(logger?: Logger) {
        this.logger = logger;
        this.inner = false;
        this._started = false;
        this.initState = new InitState(this, "init");
        this._states = [this.initState];
        this.startingState = this.initState;
        this._currentState = this.initState;
        this.currentStatePublisher = new Subject();
        this.handlers = [];
        this.eventsToProcess = [];
        this.currentSubFSM = undefined;
        this._log = false;
    }

    protected buildFSM(dataHandler?: FSMDataHandler): void {
        if (this.states.length > 1) {
            return;
        }

        this.dataHandler = dataHandler;
    }

    public get currentState(): OutputState {
        return this._currentState;
    }

    public set currentState(state: OutputState) {
        const old = this._currentState;
        this._currentState = state;
        this.currentStatePublisher.next([old, this._currentState]);
    }

    public get currentStateObservable(): Observable<[OutputState, OutputState]> {
        return this.currentStatePublisher;
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
            if (this.log) {
                this.logger?.logInteractionMsg(`processing event ${String(event.type)} in a sub-FSM`, this.constructor.name);
            }
            return this.currentSubFSM.process(event);
        }
        if (this.log) {
            this.logger?.logInteractionMsg(`processing event ${String(event.type)} at state 
            ${this.currentState.name}: ${this.constructor.name}`, this.constructor.name);
        }

        try {
            return this.currentState.process(event);
        } catch (err: unknown) {
            this.notifyHandlerOnError(err);
            return false;
        }
    }

    public get log(): boolean {
        return this._log;
    }

    public set log(log: boolean) {
        this._log = log;
    }

    public getDataHandler(): FSMDataHandler | undefined {
        return this.dataHandler;
    }

    /**
     * Removes the given KeyPress event from the events 'still in process' list.
     * @param key - The key code of the event to remove.
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

    public enterStdState(state: InputState & OutputState): void {
        this.currentState = state;
        this.checkTimeoutTransition();
        if (this.started) {
            this.onUpdating();
        }
    }

    public get started(): boolean {
        return this._started;
    }


    /**
     * The end of the FSM execution, the events still (eg keyPress) in process must be recycled to be reused in the FSM.
     */
    protected processRemainingEvents(): void {
        const list: ReadonlyArray<Event> = [...this.eventsToProcess];

        list.forEach(event => {
            removeAt(this.eventsToProcess, 0);
            if (this.log) {
                this.logger?.logInteractionMsg("Recycling event", this.constructor.name);
            }
            this.process(event);
        });
    }

    public addRemaningEventsToProcess(event: Event): void {
        this.eventsToProcess.push(event);
    }

    public onError(err: unknown): void {
        this.notifyHandlerOnError(err);
    }

    public onTerminating(): void {
        if (this.log) {
            this.logger?.logInteractionMsg("FSM ended", this.constructor.name);
        }
        if (this.started) {
            this.notifyHandlerOnStop();
        }
        this.reinit();
        this.processRemainingEvents();
    }

    public onCancelling(): void {
        if (this.log) {
            this.logger?.logInteractionMsg("FSM cancelled", this.constructor.name);
        }
        if (this.started) {
            this.notifyHandlerOnCancel();
        }
        this.fullReinit();
    }

    public onStarting(): void {
        if (this.log) {
            this.logger?.logInteractionMsg("FSM started", this.constructor.name);
        }
        this._started = true;
        this.notifyHandlerOnStart();
    }

    /**
     * Updates the state machine.
     */
    public onUpdating(): void {
        if (this.started) {
            if (this.log) {
                this.logger?.logInteractionMsg("FSM updated", this.constructor.name);
            }
            this.notifyHandlerOnUpdate();
        }
    }

    /**
     * Adds a state to the state machine.
     * @param state - The state to add. Must not be null.
     */
    public addState(state: InputState): void {
        this._states.push(state);
    }

    public reinit(): void {
        if (this.log) {
            this.logger?.logInteractionMsg("FSM reinitialised", this.constructor.name);
        }
        this.currentTimeout?.stopTimeout();
        this._started = false;
        this.currentState = this.initState;
        this.currentTimeout = undefined;
        this.currentSubFSM?.reinit();

        if (this.dataHandler !== undefined && !this.inner) {
            this.dataHandler.reinitData();
        }
    }

    public fullReinit(): void {
        this.eventsToProcess.length = 0;
        this.reinit();
        this.currentSubFSM?.fullReinit();
    }

    public onTimeout(): void {
        if (this.currentTimeout !== undefined) {
            if (this.log) {
                this.logger?.logInteractionMsg("Timeout", this.constructor.name);
            }
            const state = this.currentTimeout.execute();
            if (isOutputStateType(state)) {
                this.currentState = state;
                this.checkTimeoutTransition();
            }
        }
    }

    public stopCurrentTimeout(): void {
        if (this.currentTimeout !== undefined) {
            if (this.log) {
                this.logger?.logInteractionMsg("Timeout stopped", this.constructor.name);
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
        const tr = this.currentState.transitions
            .find(t => t instanceof TimeoutTransition) as TimeoutTransition | undefined;

        if (tr !== undefined) {
            if (this.log) {
                this.logger?.logInteractionMsg("Timeout starting", this.constructor.name);
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
            this.handlers.forEach(handler => {
                handler.fsmStarts?.();
            });
        } catch (ex: unknown) {
            if (ex instanceof CancelFSMException) {
                this.onCancelling();
            } else {
                this.logger?.logInteractionErr("An 'fsmStarts' produced an error", ex, this.constructor.name);
                this.onCancelling();
            }
            throw ex;
        }
    }

    /**
     * Notifies handler that the interaction updates.
     */
    protected notifyHandlerOnUpdate(): void {
        try {
            this.handlers.forEach(handler => {
                handler.fsmUpdates?.();
            });
        } catch (ex: unknown) {
            if (ex instanceof CancelFSMException) {
                this.onCancelling();
            } else {
                this.logger?.logInteractionErr("An 'fsmUpdates' produced an error", ex, this.constructor.name);
                this.onCancelling();
            }
            throw ex;
        }
    }

    /**
     * Notifies handler that the interaction stops.
     */
    public notifyHandlerOnStop(): void {
        try {
            [...this.handlers].forEach(handler => {
                handler.fsmStops?.();
            });
        } catch (ex: unknown) {
            if (!(ex instanceof CancelFSMException)) {
                this.logger?.logInteractionErr("An 'fsmStops' produced an error", ex, this.constructor.name);
            }
            this.onCancelling();
            throw ex;
        }
    }

    /**
     * Notifies handler that the interaction is cancelled.
     */
    protected notifyHandlerOnCancel(): void {
        try {
            [...this.handlers].forEach(handler => {
                handler.fsmCancels?.();
            });
        } catch (ex: unknown) {
            this.logger?.logInteractionErr("An 'fsmCancels' produced an error", ex, this.constructor.name);
            throw ex;
        }
    }

    /**
     * Notifies handlers that an error occured.
     */
    protected notifyHandlerOnError(err: unknown): void {
        try {
            [...this.handlers].forEach(handler => {
                handler.fsmError?.(err);
            });
        } catch (ex: unknown) {
            this.logger?.logInteractionErr("An 'fsmError' produced an error", ex, this.constructor.name);
        }
    }

    public get states(): ReadonlyArray<State> {
        return [...this._states];
    }

    public getEventsToProcess(): ReadonlyArray<Event> {
        return [...this.eventsToProcess];
    }

    public uninstall(): void {
        this.fullReinit();
        this.log = false;
        this.currentStatePublisher.complete();
        this.currentSubFSM = undefined;
        this._states.forEach(state => {
            state.uninstall();
        });
        this._states.length = 0;
        this.dataHandler = undefined;
    }
}
