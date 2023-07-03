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

import type {InteractionData} from "../interaction/InteractionData";
import type {BaseBinderBuilder, Widget} from "./BaseBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Interaction} from "../interaction/Interaction";
import type {WhenType} from "./When";

/**
 * The binding builder API that already knows the type of user interaction the bindings will use
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionBinderBuilder<I extends Interaction<D>, D extends InteractionData, A>
    extends BaseBinderBuilder {
    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * A binder can have several cummulative 'when' routines.
     * @param fn - The predicate that checks whether the command can be initialised, updated, or executed.
     * This predicate takes as arguments the data of the ongoing user interaction involved in the binding.
     * @returns A clone of the current binder to chain the building configuration.
     */
    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): InteractionBinderBuilder<I, D, A>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionBinderBuilder<I, D, A>;

    onDynamic(node: Widget<Node>): InteractionBinderBuilder<I, D, A>;

    end(fn: () => void): InteractionBinderBuilder<I, D, A>;

    log(...level: ReadonlyArray<LogLevel>): InteractionBinderBuilder<I, D, A>;

    stopImmediatePropagation(): InteractionBinderBuilder<I, D, A>;

    preventDefault(): InteractionBinderBuilder<I, D, A>;

    catch(fn: (ex: unknown) => void): InteractionBinderBuilder<I, D, A>;

    name(name: string): InteractionBinderBuilder<I, D, A>;
}
