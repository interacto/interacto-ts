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

import type {BaseBinderBuilder, Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {InteractionData} from "../interaction/InteractionData";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binding builder API that already knows the type of user interaction the bindings will use
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 * @category Helper
 */
export interface InteractionBinderBuilder<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    extends BaseBinderBuilder {
    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * A binder can have several cummulative 'when' routines.
     * @param fn - The predicate that checks whether the command can be initialised, updated, or executed.
     * This predicate takes as arguments the data of the ongoing user interaction involved in the binding.
     * @returns A clone of the current binder to chain the building configuration.
     */
    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): InteractionBinderBuilder<I, A, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionBinderBuilder<I, A, D>;

    onDynamic(node: Widget<Node>): InteractionBinderBuilder<I, A, D>;

    end(fn: () => void): InteractionBinderBuilder<I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionBinderBuilder<I, A, D>;

    stopImmediatePropagation(): InteractionBinderBuilder<I, A, D>;

    preventDefault(): InteractionBinderBuilder<I, A, D>;

    catch(fn: (ex: unknown) => void): InteractionBinderBuilder<I, A, D>;

    name(name: string): InteractionBinderBuilder<I, A, D>;

    configureRules(ruleName: RuleName, severity: Severity): InteractionBinderBuilder<I, A, D>;
}
