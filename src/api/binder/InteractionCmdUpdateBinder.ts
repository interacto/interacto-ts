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

export interface InteractionCmdUpdateBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends InteractionCmdBinder<C, I, D>, CmdUpdateBinderBuilder<C>, InteractionUpdateBinderBuilder<I, D> {
    /**
    * Specifies the update of the command on interaction command.
    * @param fn - The callback method that updates the action.
    * This callback takes as arguments the command to update and the ongoing interactions (and its parameters).
    * @returns The builder to chain the building configuration.
    */
    then(fn: ((c: C, i: D) => void) | ((c: C) => void)): InteractionCmdUpdateBinder<C, I, D>;

    continuousExecution(): InteractionCmdUpdateBinder<C, I, D>;

    strictStart(): InteractionCmdUpdateBinder<C, I, D>;

    throttle(timeout: number): InteractionCmdUpdateBinder<C, I, D>;

    first(fn: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    InteractionCmdUpdateBinder<C, I, D>;

    onDynamic(node: Widget<Node>): InteractionCmdUpdateBinder<C, I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionCmdUpdateBinder<C, I, D>;

    cancel(fn: (i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    endOrCancel(fn: (i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    when(fn: (i: D) => boolean): InteractionCmdUpdateBinder<C, I, D>;

    ifHadEffects(fn: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    ifHadNoEffect(fn: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    ifCannotExecute(fn: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    end(fn: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    stopImmediatePropagation(): InteractionCmdUpdateBinder<C, I, D>;

    preventDefault(): InteractionCmdUpdateBinder<C, I, D>;

    catch(fn: (ex: unknown) => void): InteractionCmdUpdateBinder<C, I, D>;

    bind(): Binding<C, I, D>;
}
