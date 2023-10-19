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
import type {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../binding/Linting";

/**
 * The binding builder API that already knows the type of user interaction the bindings will use
 * (for user interactions that can be updated).
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionUpdateBinderBuilder<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    extends InteractionBinderBuilder <I, A, D>, BaseUpdateBinderBuilder {
    /**
     * Defines what to do when a command is cancelled (because the interaction is cancelled).
     * The undoable command is automatically cancelled so that nothing must be done on the command.
     * A binder can have several cummulative 'cancel' routines.
     * @returns A clone of the current binder to chain the building configuration.
     */
    cancel(fn: (i: D, acc: A) => void): InteractionUpdateBinderBuilder<I, A, D>;

    /**
     * Defines what to do when a command is cancelled (because the interaction is cancelled).
     * The undoable command is automatically cancelled so that nothing must be done on the command.
     * A binder can have several cummulative 'endOrCancel' routines.
     * @returns A clone of the current binder to chain the building configuration.
     */
    endOrCancel(fn: (i: D, acc: A) => void): InteractionUpdateBinderBuilder<I, A, D>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): InteractionUpdateBinderBuilder<I, A, D>;

    end(fn: () => void): InteractionUpdateBinderBuilder<I, A, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionUpdateBinderBuilder<I, A, D>;

    onDynamic(node: Widget<Node>): InteractionUpdateBinderBuilder<I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionUpdateBinderBuilder<I, A, D>;

    stopImmediatePropagation(): InteractionUpdateBinderBuilder<I, A, D>;

    throttle(timeout: number): InteractionUpdateBinderBuilder<I, A, D>;

    continuousExecution(): InteractionUpdateBinderBuilder<I, A, D>;

    preventDefault(): InteractionUpdateBinderBuilder<I, A, D>;

    catch(fn: (ex: unknown) => void): InteractionUpdateBinderBuilder<I, A, D>;

    name(name: string): InteractionUpdateBinderBuilder<I, A, D>;

    configureRules(ruleName: RuleName, severity: Severity): InteractionUpdateBinderBuilder<I, A, D>;
}
