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
import {LogLevel} from "../logging/LogLevel";
import {Command} from "../command/Command";
import {InteractionData} from "../interaction/InteractionData";
import {BaseBinderBuilder, Widget} from "./BaseBinderBuilder";
import {InteractionBinder} from "./InteractionBinder";
import {CmdBinder} from "./CmdBinder";
import {Interaction} from "../interaction/Interaction";

/**
 * The base interface for building bindings with routines
 * for defining the UI command and the user interaction to use.
 */
export interface BaseBinder extends BaseBinderBuilder {
    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>): BaseBinder;

    onDynamic(node: Widget<Node>): BaseBinder;

    when(whenPredicate: () => boolean): BaseBinder;

    end(endFct: () => void): BaseBinder;

    log(...level: ReadonlyArray<LogLevel>): BaseBinder;

    catch(fn: (ex: unknown) => void): BaseBinder;

    /**
     * Defines how to create the UI command that will produce the binding.
     * @param cmdSupplier - The supplier that will return a new UI command on each call.
     * @typeParam C - The type of the UI command
     * @returns A clone of the current builder to chain the building configuration.
     */
    toProduce<C extends Command>(cmdSupplier: () => C): CmdBinder<C>;

    /**
     * Defines how to create the user interaction that the binding will use to create UI commands.
     * @param interactionSupplier - The supplier that will return a new user interaction.
     * @typeParam D - The user interaction data type
     * @typeParam I - The user interaction type
     * @returns A clone of the current builder to chain the building configuration.
     */
    usingInteraction<I extends Interaction<D>, D extends InteractionData>(interactionSupplier: () => I): InteractionBinder<I, D>;
}
