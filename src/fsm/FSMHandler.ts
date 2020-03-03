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

 /**
 * Defines a handler that can register an FSM to receive notifications
 * about changes in the state of the FSM.
 */
export interface FSMHandler {
    /**
     * When the FSM starts.
     * @throws CancelFSMException If the FSM must be cancelled.
     */
    fsmStarts(): void;

    /**
     * When the FSM runs to new state.
     * @throws CancelFSMException If the FSM must be cancelled.
     */
    fsmUpdates(): void;

    /**
     * When the FSM enters a terminal state.
     * @throws CancelFSMException If the FSM must be cancelled.
     */
    fsmStops(): void;

    /**
     * When the interaction enters a cancelling state.
     */
    fsmCancels(): void;
}

