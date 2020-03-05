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

import { State } from "./State";
import { Transition } from "./Transition";

/**
 * Defines a type of state that can produce as output events.
 * @param <E> The type of events the FSM processes.
 */
export interface OutputState extends State {
    exit(): void;

    /**
     * Asks to the state to process of the given event.
     * @param {*} event The event to process. Can be null.
     * @return {boolean}
     */
    process(event: Event): boolean;

    getTransitions(): Array<Transition>;

    addTransition(tr: Transition): void;
}

export function isOutputStateType<E>(obj: OutputState | object): obj is OutputState {
    return (obj as OutputState).exit !== undefined && (obj as OutputState).addTransition !== undefined &&
        (obj as OutputState).process !== undefined && (obj as OutputState).getTransitions !== undefined;
}
