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
import type {CmdUpdateBinderBuilder} from "./CmdUpdateBinderBuilder";
import type {InteractionCmdBinder} from "./InteractionCmdBinder";
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {WhenType} from "./When";
import type {Binding} from "../binding/Binding";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binder API that already knows the type of UI command and the user interaction to use
 * (for user interactions that can be updated).
 * @typeParam C - The type of the produced UI commands
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 * @category API Binding
 */
// eslint-disable-next-line no-use-before-define
export interface InteractionCmdUpdateBinder<C extends Command, I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
    extends InteractionCmdBinder<C, I, A, D>, CmdUpdateBinderBuilder<C>, InteractionUpdateBinderBuilder<I, A, D> {
    /**
     * Permits to update the command on each interaction update.
     * A binder can have several cummulative 'then' routines.
     * This routine is called only if 'when' returns true (ie only if
     * the condition for producing the command is respected).
     * See 'ifCannotExecute' for a 'then' when this condition is not respected.
     * @param fn - The callback method that updates the command.
     * This callback takes as arguments the command to update and the ongoing interactions (and its parameters).
     * @returns The binder to chain the building configuration.
     */
    then(fn: ((c: C, i: D, acc: A) => void) | ((c: C) => void)): InteractionCmdUpdateBinder<C, I, A, D>;

    continuousExecution(): InteractionCmdUpdateBinder<C, I, A, D>;

    throttle(timeout: number): InteractionCmdUpdateBinder<C, I, A, D>;

    first(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionCmdUpdateBinder<C, I, A, D>;

    onDynamic(node: Widget<Node>): InteractionCmdUpdateBinder<C, I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionCmdUpdateBinder<C, I, A, D>;

    cancel(fn: (i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    endOrCancel(fn: (i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): InteractionCmdUpdateBinder<C, I, A, D>;

    ifHadEffects(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    ifCannotExecute(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    end(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    stopImmediatePropagation(): InteractionCmdUpdateBinder<C, I, A, D>;

    preventDefault(): InteractionCmdUpdateBinder<C, I, A, D>;

    catch(fn: (ex: unknown) => void): InteractionCmdUpdateBinder<C, I, A, D>;

    name(name: string): InteractionCmdUpdateBinder<C, I, A, D>;

    configureRules(ruleName: RuleName, severity: Severity): InteractionCmdUpdateBinder<C, I, A, D>;

    bind(): Binding<C, I, A, D>;
}
