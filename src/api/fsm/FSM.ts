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

import {Observable} from "rxjs";
import {OutputState} from "./OutputState";
import {State} from "./State";
import {FSMHandler} from "./FSMHandler";
import {InputState} from "./InputState";

/**
 * A finite state machine that defines the behavior of a user interaction.
 */
export interface FSM {
    /**
     * @return The set of the states that compose the FSM.
     * This returns a copy of the real set.
     */
    getStates(): Array<State>;

    /**
     * @return The current state of FSM during its execution.
     */
    getCurrentState(): OutputState;

    setCurrentState(state: OutputState): void;

    /**
     * @return An observable value for observing the current state of FSM during its execution.
     */
    currentStateObservable(): Observable<[OutputState, OutputState]>;

    getInitState(): OutputState;

    /**
     * Processes the provided event to run the FSM.
     * @param event The event to process.
     * @return True: the FSM correctly processed the event.
     */
    process(event: Event): boolean;

    /**
     * Logs (or not) information about the execution of the FSM.
     * @param log True: logging activated.
     */
    log(log: boolean): void;

    /**
     * @return True: The FSM started.
     */
    isStarted(): boolean;

    getStartingState(): State;

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

    enterStdState(state: OutputState & InputState): void;

    /**
     * States whether the FSM is an inner FSM (ie, whether it is included into another FSM as
     * a sub-FSM transition).
     * @param inner True: this FSM will be considered as an inner FSM.
     */
    setInner(inner: boolean): void;

    /**
     * @return True: this FSM is an inner FSM.
     */
    getInner(): boolean;

    setCurrentSubFSM(subFSM?: FSM): void;

    /**
     * Adds an FSM handler.
     * @param handler The handler to add.
     */
    addHandler(handler: FSMHandler): void;

    /**
     * Removes the given FSM handler from this FSM.
     * @param handler The handler to remove.
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
}
