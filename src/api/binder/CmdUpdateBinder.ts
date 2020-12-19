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
import {CmdUpdateBinderBuilder} from "./CmdUpdateBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {InteractionData} from "../interaction/InteractionData";
import {InteractionCmdUpdateBinder} from "./InteractionCmdUpdateBinder";
import {Interaction} from "../interaction/Interaction";
import {NodeWidget, Widget} from "./BaseBinderBuilder";

/**
 * The binder API that already knows the type of UI command
 * the bindings will produce. Routines related to interactions that can be updated are provided (then).
 * @typeParam C - The type of the produced UI Commands
 */
export interface CmdUpdateBinder<C extends Command> extends CmdUpdateBinderBuilder<C> {
    then(update: (c: C) => void): CmdUpdateBinder<C>;

    continuousExecution(): CmdUpdateBinder<C>;

    strictStart(): CmdUpdateBinder<C>;

    throttle(timeout: number): CmdUpdateBinder<C>;

    first(initCmdFct: (c: C) => void): CmdUpdateBinder<C>;

    on(widget: Widget | ReadonlyArray<Widget>, ...widgets: ReadonlyArray<Widget>): CmdUpdateBinder<C>;

    onDynamic(node: NodeWidget): CmdUpdateBinder<C>;

    when(whenPredicate: () => boolean): CmdUpdateBinder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdUpdateBinder<C>;

    end(onEnd: (c: C) => void): CmdUpdateBinder<C>;

    usingInteraction<I extends Interaction<D>, D extends InteractionData>
    (interactionSupplier: () => I): InteractionCmdUpdateBinder<C, I, D>;

    stopImmediatePropagation(): CmdUpdateBinder<C>;

    preventDefault(): CmdUpdateBinder<C>;
}
