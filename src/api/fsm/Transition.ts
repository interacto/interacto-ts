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

import {InputState} from "./InputState";

/**
 * The concept of FSM transition.
 */
export interface Transition<E extends Event> {
    /**
     * Executes the transition.
     * @param event The event to process.
     * @return The potential output state.
     * @throws CancelFSMException If the execution cancels the FSM execution.
     */
    execute(event: Event): InputState | undefined;

    isGuardOK(event: E): boolean;

    accept(event: Event): event is E;

    /**
     * @return The set of events accepted by the transition.
     */
    getAcceptedEvents(): Set<string>;

    getTarget(): InputState;

    /**
     * Clean the transition when not used anymore.
     */
    uninstall(): void;
}
