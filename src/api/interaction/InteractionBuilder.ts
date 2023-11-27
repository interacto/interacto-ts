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

import type {Interaction, InteractionDataType} from "./Interaction";
import type {InteractionData} from "./InteractionData";

/**
 * A builder for customizing an existing user interaction
 * with specific predicates that restricts the execution of the user
 * interaction. These predicates can run at the start, the updates,
 * and the end of the user interaction execution.
 */
export interface InteractionBuilder<I extends Interaction<D>, D extends InteractionData = InteractionDataType<I>> {
    /**
     * A predicate to execution just before the interaction starts.
     * @param predicate - The predicate to execute. If it returns true, the
     * interaction is cancelled.
     */
    first(predicate: (i: D) => boolean): this;

    /**
     * A predicate to execution just before each interaction update.
     * @param predicate - The predicate to execute. If it returns true, the
     * interaction is cancelled.
     */
    then(predicate: (i: D) => boolean): this;

    /**
     * Combines 'first' and 'then'.
     * @param predicate - The predicate to execute. If it returns true, the
     * interaction is cancelled.
     */
    firstAndThen(predicate: (i: D) => boolean): this;

    /**
     * A predicate to execution just before the end of the interaction execution.
     * @param predicate - The predicate to execute. If it returns true, the
     * interaction is cancelled.
     */
    end(predicate: (i: D) => boolean): this;

    /**
     * It is recommanded to change the name of the customized user interaction
     * with a unique name.
     * @param name - The unique name of the customized user interaction.
     */
    name(name: string): this;

    /**
     * @returns a command that produces an instance of the customized command.
     */
    build(): () => I;
}
