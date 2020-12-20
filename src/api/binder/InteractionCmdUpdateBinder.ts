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
import {Command} from "../command/Command";
import {InteractionData} from "../interaction/InteractionData";
import {InteractionCmdBinder} from "./InteractionCmdBinder";
import {CmdUpdateBinderBuilder} from "./CmdUpdateBinderBuilder";
import {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {Binding} from "../binding/Binding";
import {Interaction} from "../interaction/Interaction";
import {Widget} from "./BaseBinderBuilder";

export interface InteractionCmdUpdateBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends InteractionCmdBinder<C, I, D>, CmdUpdateBinderBuilder<C>, InteractionUpdateBinderBuilder<I, D> {
    /**
    * Specifies the update of the command on interaction command.
    * @param update - The callback method that updates the action.
    * This callback takes as arguments the command to update and the ongoing interactions (and its parameters).
    * @returns The builder to chain the building configuration.
    */
    then(update: ((c: C, i: D) => void) | ((c: C) => void)): InteractionCmdUpdateBinder<C, I, D>;

    continuousExecution(): InteractionCmdUpdateBinder<C, I, D>;

    strictStart(): InteractionCmdUpdateBinder<C, I, D>;

    throttle(timeout: number): InteractionCmdUpdateBinder<C, I, D>;

    first(initCmdFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    on(widget: Widget<EventTarget> | ReadonlyArray<Widget<EventTarget>>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    InteractionCmdUpdateBinder<C, I, D>;

    onDynamic(node: Widget<Node>): InteractionCmdUpdateBinder<C, I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionCmdUpdateBinder<C, I, D>;

    cancel(cancel: (i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    endOrCancel(endOrCancel: (i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    when(whenPredicate: (i: D) => boolean): InteractionCmdUpdateBinder<C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    ifCannotExecute(cannotExec: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    end(onEnd: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    stopImmediatePropagation(): InteractionCmdUpdateBinder<C, I, D>;

    preventDefault(): InteractionCmdUpdateBinder<C, I, D>;

    bind(): Binding<C, I, D>;
}
