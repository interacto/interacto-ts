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

import type {EventType} from "./EventType";
import type {InputState} from "./InputState";
import type {VisitorFSM} from "./VisitorFSM";

/**
 * The concept of FSM transition.
 */
export interface Transition<E extends Event> {
    readonly target: InputState;

    /**
     * Executes the transition.
     * @param event - The event to process.
     * @returns The potential output state.
     * @throws CancelFSMException If the execution cancels the FSM execution.
     */
    execute(event: Event): InputState | undefined;

    guard(event: E): boolean;

    accept(event: Event): event is E;

    /**
     * Visiting the transition.
     * @param visitor - The visitor.
     */
    acceptVisitor(visitor: VisitorFSM): void;

    /**
     * @returns The set of events accepted by the transition.
     */
    getAcceptedEvents(): ReadonlySet<EventType>;

    /**
     * Clean the transition when not used anymore.
     */
    uninstall(): void;
}
