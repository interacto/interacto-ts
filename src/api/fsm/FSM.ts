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

import type {FSMHandler} from "./FSMHandler";
import type {InputState} from "./InputState";
import type {OutputState} from "./OutputState";
import type {State} from "./State";
import type {VisitorFSM} from "./VisitorFSM";
import type {Observable} from "rxjs";

/**
 * A finite state machine that defines the behavior of a user interaction.
 */
export interface FSM {
    /**
     * The set of the states that compose the FSM.
     * This returns a copy of the real set.
     */
    readonly states: ReadonlyArray<State>;

    /**
     * The current state of the FSM.
     */
    currentState: OutputState;

    /**
     * An observable value for observing the current state of FSM during its execution.
     */
    readonly currentStateObservable: Observable<[OutputState, OutputState]>;

    /**
     * The initial state of the FSM
     */
    readonly initState: OutputState;

    /**
     * By default an FSM triggers its 'start' event when it leaves its initial state.
     * In some cases, this is not the case. For example, a double-click interaction is an FSM that must trigger
     * its start event when the FSM reaches... its terminal state. Similarly, a DnD must trigger its start event
     * on the first move, not on the first press.
     * The goal of this attribute is to identify the state of the FSM that must trigger the start event.
     * By default, this attribute is set with the initial state of the FSM.
     */
    readonly startingState: State;

    /**
     * True: The FSM started.
     */
    readonly started: boolean;

    /**
     * Defines whether the FSM is an inner FSM (ie, whether it is included into another FSM as
     * a sub-FSM transition).
     */
    inner: boolean;

    /**
     * The current sub FSM in which this FSM is while running.
     */
    currentSubFSM: FSM | undefined;

    /**
     * Logs (or not) information about the execution of the FSM.
     */
    log: boolean;

    /**
     * Processes the provided event to run the FSM.
     * @param event - The event to process.
     * @returns True: the FSM correctly processed the event.
     */
    process(event: Event): boolean;

    /**
     * Starts the state machine.
     */
    onStarting(): void;

    /**
     * Updates the state machine.
     */
    onUpdating(): void;

    /**
     * Cancels the state machine.
     */
    onCancelling(): void;

    /**
     * Terminates the state machine.
     */
    onTerminating(): void;

    /**
     * Processes an error produced in the FSM.
     * @param err - The error to treat.
     */
    onError(err: unknown): void;

    /**
     * Jobs to do when a timeout transition is executed.
     * Because the timeout transition is based on a separated thread, the job
     * done by this method must be executed in the UI thread.
     * UI Platforms must override this method to do that.
     */
    onTimeout(): void;

    /**
     * Stops the current timeout transition.
     */
    stopCurrentTimeout(): void;

    enterStdState(state: InputState & OutputState): void;

    /**
     * Adds an FSM handler.
     * @param handler - The handler to add.
     */
    addHandler(handler: FSMHandler): void;

    /**
     * Removes the given FSM handler from this FSM.
     * @param handler - The handler to remove.
     */
    removeHandler(handler: FSMHandler): void;

    /**
     * Reinitialises the FSM.
     * Remaining events to process are however not clear.
     * See [[`FSM#fullReinit`]] for that.
     */
    reinit(): void;

    /**
     * Reinitialises the FSM.
     * Compared to [[`FSM#reinit`]] this method
     * flushes the remaining events to process.
     */
    fullReinit(): void;

    /**
     * Uninstall the FSM.
     * Useful for flushing memory.
     * The FSM must not be used after that.
     */
    uninstall(): void;

    /**
     * Visiting the FSM.
     * @param visitor - The visitor.
     */
    acceptVisitor(visitor: VisitorFSM): void;
}
