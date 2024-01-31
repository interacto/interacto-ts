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

import {CancelFSMError} from "./CancelFSMError";
import {CancellingState} from "./CancellingState";
import {isKeyDownEvent, isKeyUpEvent} from "./Events";
import {InitState} from "./InitState";
import {StdState} from "./StdState";
import {TerminalState} from "./TerminalState";
import {TimeoutTransition} from "./TimeoutTransition";
import {isOutputStateType} from "../../api/fsm/OutputState";
import {MustBeUndoableCmdError} from "../binding/MustBeUndoableCmdError";
import {remove, removeAt} from "../util/ArrayUtil";
import {Subject} from "rxjs";
import type {FSMDataHandler} from "./FSMDataHandler";
import type {FSM} from "../../api/fsm/FSM";
import type {FSMHandler} from "../../api/fsm/FSMHandler";
import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";
import type {State} from "../../api/fsm/State";
import type {VisitorFSM} from "../../api/fsm/VisitorFSM";
import type {Logger} from "../../api/logging/Logger";
import type {Observable} from "rxjs";

/**
 * A finite state machine that defines the behavior of a user interaction.
 * @category FSM
 */
export class FSMImpl<T extends FSMDataHandler> implements FSM {
    protected _dataHandler: T | undefined;

    protected readonly logger: Logger;

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
    protected currentTimeout: TimeoutTransition | undefined;

    public currentSubFSM: FSM | undefined;

    /**
     * Creates the FSM.
     * @param logger - The logger to use for logging FSM messages
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(logger: Logger, dataHandler?: T) {
        this._dataHandler = dataHandler;
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
            !this.eventsToProcess.some(evt => isKeyDownEvent(evt) && evt.code === event.code)) {
            this.addRemaningEventsToProcess(event);
        }

        return processed;
    }

    private processEvent(event: Event): boolean {
        if (this.currentSubFSM !== undefined) {
            if (this.log) {
                this.logger.logInteractionMsg(`processing event ${String(event.type)} in a sub-FSM`, this.constructor.name);
            }
            return this.currentSubFSM.process(event);
        }
        if (this.log) {
            this.logger.logInteractionMsg(`processing event ${String(event.type)} at state
            ${this.currentState.name}: ${this.constructor.name}`, this.constructor.name);
        }

        try {
            return this.currentState.process(event);
        } catch (error: unknown) {
            this.notifyHandlerOnError(error);
            return false;
        }
    }

    public acceptVisitor(visitor: VisitorFSM): void {
        visitor.visitFSM(this);
    }

    public get log(): boolean {
        return this._log;
    }

    public set log(log: boolean) {
        this._log = log;
    }

    public get dataHandler(): T | undefined {
        return this._dataHandler;
    }

    public set dataHandler(dataHandler: T | undefined) {
        this._dataHandler = dataHandler;
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
        const list: ReadonlyArray<Event> = Array.from(this.eventsToProcess);

        for (const event of list) {
            removeAt(this.eventsToProcess, 0);
            if (this.log) {
                this.logger.logInteractionMsg("Recycling event", this.constructor.name);
            }
            this.process(event);
        }
    }

    public addRemaningEventsToProcess(event: Event): void {
        this.eventsToProcess.push(event);
    }

    public onError(err: unknown): void {
        this.notifyHandlerOnError(err);
    }

    public onTerminating(): void {
        if (this.log) {
            this.logger.logInteractionMsg("FSM ended", this.constructor.name);
        }
        if (this.started) {
            this.notifyHandlerOnStop();
        }
        this.reinit();
        this.processRemainingEvents();
    }

    public onCancelling(): void {
        if (this.log) {
            this.logger.logInteractionMsg("FSM cancelled", this.constructor.name);
        }
        if (this.started) {
            this.notifyHandlerOnCancel();
        }
        this.fullReinit();
    }

    public onStarting(): void {
        if (this.log) {
            this.logger.logInteractionMsg("FSM started", this.constructor.name);
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
                this.logger.logInteractionMsg("FSM updated", this.constructor.name);
            }
            this.notifyHandlerOnUpdate();
        }
    }

    /**
     * Adds a standard state to the state machine.
     * @param name - The name of the state to add.
     * @param startingState - States whether the new state is the one that starts the FSM.
     * @returns The created state.
     */
    public addStdState(name: string, startingState = false): StdState {
        const state = new StdState(this, name);
        this.addState(state, startingState);
        return state;
    }

    /**
     * Adds a terminal state to the state machine.
     * @param name - The name of the state to add.
     * @param startingState - States whether the new state is the one that starts the FSM.
     * @returns The created state.
     */
    public addTerminalState(name: string, startingState = false): TerminalState {
        const state = new TerminalState(this, name);
        this.addState(state, startingState);
        return state;
    }

    /**
     * Adds a cancelling state to the state machine.
     * @param name - The name of the state to add.
     * @returns The created state.
     */
    public addCancellingState(name: string): CancellingState {
        const state = new CancellingState(this, name);
        this.addState(state);
        return state;
    }

    private addState(state: InputState, startingState = false): void {
        this._states.push(state);
        if (startingState) {
            this.startingState = state;
        }
    }

    public reinit(): void {
        if (this.log) {
            this.logger.logInteractionMsg("FSM reinitialised", this.constructor.name);
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
                this.logger.logInteractionMsg("Timeout", this.constructor.name);
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
                this.logger.logInteractionMsg("Timeout stopped", this.constructor.name);
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
            .find(trans => trans instanceof TimeoutTransition) as TimeoutTransition | undefined;

        if (tr !== undefined) {
            if (this.log) {
                this.logger.logInteractionMsg("Timeout starting", this.constructor.name);
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
            const hs = Array.from(this.handlers);

            for (const handler of hs) {
                handler.preFsmStart?.();
            }

            for (const handler of hs) {
                handler.fsmStarts?.();
            }
        } catch (error: unknown) {
            if (!(error instanceof CancelFSMError || error instanceof MustBeUndoableCmdError)) {
                this.logger.logInteractionErr("An 'fsmStarts' produced an error", error, this.constructor.name);
            }
            this.onCancelling();
            throw error;
        }
    }

    /**
     * Notifies handler that the interaction updates.
     */
    protected notifyHandlerOnUpdate(): void {
        try {
            const hs = Array.from(this.handlers);

            for (const handler of hs) {
                handler.preFsmUpdate?.();
            }

            for (const handler of hs) {
                handler.fsmUpdates?.();
            }
        } catch (error: unknown) {
            if (!(error instanceof CancelFSMError || error instanceof MustBeUndoableCmdError)) {
                this.logger.logInteractionErr("An 'fsmUpdates' produced an error", error, this.constructor.name);
            }
            this.onCancelling();
            throw error;
        }
    }

    /**
     * Notifies handler that the interaction stops.
     */
    public notifyHandlerOnStop(): void {
        try {
            const hs = Array.from(this.handlers);

            for (const handler of hs) {
                handler.preFsmStop?.();
            }

            for (const handler of hs) {
                handler.fsmStops?.();
            }
        } catch (error: unknown) {
            if (!(error instanceof CancelFSMError || error instanceof MustBeUndoableCmdError)) {
                this.logger.logInteractionErr("An 'fsmStops' produced an error", error, this.constructor.name);
            }
            this.onCancelling();
            throw error;
        }
    }

    /**
     * Notifies handler that the interaction is cancelled.
     */
    protected notifyHandlerOnCancel(): void {
        try {
            for (const handler of Array.from(this.handlers)) {
                handler.fsmCancels?.();
            }
        } catch (error: unknown) {
            if (!(error instanceof MustBeUndoableCmdError)) {
                this.logger.logInteractionErr("An 'fsmCancels' produced an error", error, this.constructor.name);
            }
            throw error;
        }
    }

    /**
     * Notifies handlers that an error occured.
     * @param err - The error to handle
     */
    protected notifyHandlerOnError(err: unknown): void {
        try {
            for (const handler of Array.from(this.handlers)) {
                handler.fsmError?.(err);
            }
        } catch (error: unknown) {
            this.logger.logInteractionErr("An 'fsmError' produced an error", error, this.constructor.name);
        }
    }

    public get states(): ReadonlyArray<State> {
        return Array.from(this._states);
    }

    public getEventsToProcess(): ReadonlyArray<Event> {
        return Array.from(this.eventsToProcess);
    }

    public uninstall(): void {
        this.fullReinit();
        this.log = false;
        this.currentStatePublisher.complete();
        this.currentSubFSM = undefined;
        for (const state of this._states) {
            state.uninstall();
        }
        this._states.length = 0;
        this.dataHandler = undefined;
    }
}
