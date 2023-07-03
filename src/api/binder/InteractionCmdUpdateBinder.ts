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
import type {Command} from "../command/Command";
import type {InteractionData} from "../interaction/InteractionData";
import type {InteractionCmdBinder} from "./InteractionCmdBinder";
import type {CmdUpdateBinderBuilder} from "./CmdUpdateBinderBuilder";
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Binding} from "../binding/Binding";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";

/**
 * The binder API that already knows the type of UI command and the user interaction to use
 * (for user interactions that can be updated).
 * @typeParam C - The type of the produced UI commands
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionCmdUpdateBinder<C extends Command, I extends Interaction<D>, D extends InteractionData, A>
    extends InteractionCmdBinder<C, I, D, A>, CmdUpdateBinderBuilder<C>, InteractionUpdateBinderBuilder<I, D, A> {
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
    then(fn: ((c: C, i: D, acc: A) => void) | ((c: C) => void)): InteractionCmdUpdateBinder<C, I, D, A>;

    continuousExecution(): InteractionCmdUpdateBinder<C, I, D, A>;

    throttle(timeout: number): InteractionCmdUpdateBinder<C, I, D, A>;

    first(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionCmdUpdateBinder<C, I, D, A>;

    onDynamic(node: Widget<Node>): InteractionCmdUpdateBinder<C, I, D, A>;

    log(...level: ReadonlyArray<LogLevel>): InteractionCmdUpdateBinder<C, I, D, A>;

    cancel(fn: (i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    endOrCancel(fn: (i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): InteractionCmdUpdateBinder<C, I, D, A>;

    ifHadEffects(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    ifCannotExecute(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    end(fn: (c: C, i: D, acc: A) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    stopImmediatePropagation(): InteractionCmdUpdateBinder<C, I, D, A>;

    preventDefault(): InteractionCmdUpdateBinder<C, I, D, A>;

    catch(fn: (ex: unknown) => void): InteractionCmdUpdateBinder<C, I, D, A>;

    name(name: string): InteractionCmdUpdateBinder<C, I, D, A>;

    bind(): Binding<C, I, D, A>;
}
