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
import type {InteractionUpdateBinder} from "./InteractionUpdateBinder";
import type {KeyInteractionBinderBuilder} from "./KeyInteractionBinderBuilder";
import type {WhenType} from "./When";
import type {Binding} from "../binding/Binding";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binder API for key-based user interactions, that already knows the type of the user interaction to use and
 * the type of command the binding will produce (for user interactions that can be updated).
 * @typeParam C - The type of the produced UI commands
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 * @category API Binding
 */
// eslint-disable-next-line no-use-before-define
export interface KeyInteractionCmdUpdateBinder<C extends Command, I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
    extends KeyInteractionBinderBuilder<I, A, D>, InteractionUpdateBinder<I, A, D> {

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    then(fn: ((c: C, i: D, acc: A) => void) | ((c: C) => void)): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    continuousExecution(): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    throttle(timeout: number): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    first(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    onDynamic(node: Widget<Node>): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    cancel(fn: (i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    endOrCancel(fn: (i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    ifHadEffects(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    ifCannotExecute(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    end(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    stopImmediatePropagation(): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    preventDefault(): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    name(name: string): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    configureRules(ruleName: RuleName, severity: Severity): KeyInteractionCmdUpdateBinder<C, I, A, D>;

    bind(): Binding<C, I, A, D>;
}
