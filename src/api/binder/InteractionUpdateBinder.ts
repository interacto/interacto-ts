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
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Command} from "../command/Command";
import type {InteractionCmdUpdateBinder} from "./InteractionCmdUpdateBinder";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";

/**
 * The binder API that already knows the type of the user interaction to use
 * (for user interactions that can be updated).
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionUpdateBinder<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    extends InteractionUpdateBinderBuilder<I, A, D> {
    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionUpdateBinder<I, A, D>;

    onDynamic(node: Widget<Node>): InteractionUpdateBinder<I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionUpdateBinder<I, A, D>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): InteractionUpdateBinder<I, A, D>;

    end(fn: () => void): InteractionUpdateBinder<I, A, D>;

    cancel(fn: (i: D, acc: A) => void): InteractionUpdateBinder<I, A, D>;

    endOrCancel(fn: (i: D, acc: A) => void): InteractionUpdateBinder<I, A, D>;

    stopImmediatePropagation(): InteractionUpdateBinder<I, A, D>;

    preventDefault(): InteractionUpdateBinder<I, A, D>;

    throttle(timeout: number): InteractionUpdateBinder<I, A, D>;

    continuousExecution(): InteractionUpdateBinder<I, A, D>;

    catch(fn: (ex: unknown) => void): InteractionUpdateBinder<I, A, D>;

    name(name: string): InteractionUpdateBinder<I, A, D>;

    configureRules(ruleName: RuleName, severity: Severity): InteractionUpdateBinder<I, A, D>;

    toProduce<C extends Command>(fn: (i: D) => C): InteractionCmdUpdateBinder<C, I, A, D>;

    toProduceAnon(fn: () => void): InteractionCmdUpdateBinder<Command, I, A, D>;
}
