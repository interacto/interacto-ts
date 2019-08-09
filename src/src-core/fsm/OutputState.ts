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

import {State} from "./State";
import {Transition} from "./Transition";

export interface OutputState<E> extends State<E> {
    exit(): void;

    /**
     * Asks to the state to process of the given event.
     * @param {*} event The event to process. Can be null.
     * @return {boolean}
     */
    process(event: E): boolean;

    getTransitions(): Array<Transition<E>>;

    addTransition(tr: Transition<E>): void;
}

export function isOutputStateType<E>(obj: OutputState<E> | Object): obj is OutputState<E> {
    return (<OutputState<E>>obj).exit !== undefined && (<OutputState<E>>obj).addTransition !== undefined &&
        (<OutputState<E>>obj).process !== undefined && (<OutputState<E>>obj).getTransitions !== undefined;
}
