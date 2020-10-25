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
import {LogLevel} from "../../logging/LogLevel";
import {Command} from "../../command/Command";
import {InteractionData} from "../../interaction/InteractionData";
import {BaseBinderBuilder} from "./BaseBinderBuilder";
import {FSM} from "../../fsm/FSM";
import {InteractionBinder} from "./InteractionBinder";
import {CmdBinder} from "./CmdBinder";
import {Interaction} from "../../interaction/Interaction";

/**
 * The base interface for building widget bindings with routines
 * for defining the UI command and the user interaction to use.
 */
export interface BaseBinder extends BaseBinderBuilder {
    on(...widgets: Array<EventTarget>): BaseBinder;

    onDynamic(node: Node): BaseBinder;

    when(whenPredicate: () => boolean): BaseBinder;

    end(endFct: () => void): BaseBinder;

    log(...level: Array<LogLevel>): BaseBinder;

    /**
     * Defines how to create the UI command that will produce the widget binding.
     * @param cmdSupplier The supplier that will return a new UI command on each call.
     * @type <C> The type of the UI command
     * @return A clone of the current builder to chain the building configuration.
     */
    toProduce<C extends Command>(cmdSupplier: () => C): CmdBinder<C>;

    /**
     * Defines how to create the user interaction that the widget binding will use to create UI commands.
     * @param interactionSupplier The supplier that will return a new user interaction.
     * @type <D> The user interaction data type
     * @type <I> The user interaction type
     * @return A clone of the current builder to chain the building configuration.
     */
    usingInteraction<I extends Interaction<D, FSM>, D extends InteractionData>(interactionSupplier: () => I): InteractionBinder<I, D>;
}
