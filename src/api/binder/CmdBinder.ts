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
import {CmdBinderBuilder} from "./CmdBinderBuilder";
import {InteractionCmdBinder} from "./InteractionCmdBinder";
import {LogLevel} from "../logging/LogLevel";
import {Interaction} from "../interaction/Interaction";
import {NodeWidget, Widget} from "./BaseBinderBuilder";

/**
 * The binder API that already knows the type of UI command
 * the bindings will produce.
 * @typeParam C - The type of the produced UI Commands
 */
export interface CmdBinder<C extends Command> extends CmdBinderBuilder<C> {
    first(initCmdFct: (c: C) => void): CmdBinder<C>;

    end(onEnd: (c: C) => void): CmdBinder<C>;

    on(widget: Widget | ReadonlyArray<Widget>, ...widgets: ReadonlyArray<Widget>): CmdBinder<C>;

    onDynamic(node: NodeWidget): CmdBinder<C>;

    when(whenPredicate: () => boolean): CmdBinder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdBinder<C>;

    /**
     * Defines how to create the user interaction that the binding will use to create UI commands.
     * @param interactionSupplier - The supplier that will return a new user interaction.
     * @typeParam D - The user interaction data type
     * @typeParam I - The user interaction type
     * @returns A clone of the current builder to chain the building configuration.
     */
    usingInteraction<I extends Interaction<D>, D extends InteractionData>(interactionSupplier: () => I):
    InteractionCmdBinder<C, I, D>;

    stopImmediatePropagation(): CmdBinder<C>;

    preventDefault(): CmdBinder<C>;
}
