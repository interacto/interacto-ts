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

import type {Widget} from "./BaseBinderBuilder";
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {KeyBinderBuilder} from "./KeyBinderBuilder";
import type {KeyInteractionCmdUpdateBinder} from "./KeyInteractionCmdUpdateBinder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {InteractionData} from "../interaction/InteractionData";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binder API for key-based user interactions, that already knows the type of the user interaction to use
 * (for user interactions that can be updated).
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 * @category Helper
 */
export interface KeyInteractionUpdateBinder<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    extends InteractionUpdateBinderBuilder<I, A, D>, KeyBinderBuilder {

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeyInteractionUpdateBinder<I, A, D>;

    onDynamic(node: Widget<Node>): KeyInteractionUpdateBinder<I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionUpdateBinder<I, A, D>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): KeyInteractionUpdateBinder<I, A, D>;

    continuousExecution(): KeyInteractionUpdateBinder<I, A, D>;

    throttle(timeout: number): KeyInteractionUpdateBinder<I, A, D>;

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionUpdateBinder<I, A, D>;

    stopImmediatePropagation(): KeyInteractionUpdateBinder<I, A, D>;

    preventDefault(): KeyInteractionUpdateBinder<I, A, D>;

    cancel(fn: (i: D, acc: A) => void): KeyInteractionUpdateBinder<I, A, D>;

    endOrCancel(fn: (i: D, acc: A) => void): KeyInteractionUpdateBinder<I, A, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionUpdateBinder<I, A, D>;

    name(name: string): KeyInteractionUpdateBinder<I, A, D>;

    configureRules(ruleName: RuleName, severity: Severity): KeyInteractionUpdateBinder<I, A, D>;

    toProduce<C extends Command>(fn: (i: D) => C): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    toProduceAnon(fn: () => void): KeyInteractionCmdUpdateBinder<Command, I, A, D>;
}
