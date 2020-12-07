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

import {InteractionData} from "../interaction/InteractionData";
import {BaseBinderBuilder} from "./BaseBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {Interaction} from "../interaction/Interaction";

/**
 * The binding builder API that already knows the type of user interaction the bindings will use.
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionBinderBuilder<I extends Interaction<D>, D extends InteractionData>
    extends BaseBinderBuilder {
    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * @param whenPredicate - The predicate that checks whether the command can be initialised, updated, or executed.
     * This predicate takes as arguments the ongoing user interaction involved in the binding.
     * @returns A clone of the current builder to chain the building configuration.
     */
    when(whenPredicate: (i: D) => boolean): InteractionBinderBuilder<I, D>;

    on(widget: EventTarget, ...widgets: ReadonlyArray<EventTarget>): InteractionBinderBuilder<I, D>;

    onDynamic(node: Node): InteractionBinderBuilder<I, D>;

    end(endFct: () => void): InteractionBinderBuilder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionBinderBuilder<I, D>;

    stopImmediatePropagation(): InteractionBinderBuilder<I, D>;

    preventDefault(): InteractionBinderBuilder<I, D>;
}
