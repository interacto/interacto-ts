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

/**
 * The base interface for building bindings.
 */
export interface BaseBinderBuilder {
    /**
     * Specifies the widgets on which the binding must operate.
     * When a widget is added to this list, the added widget is binded to this binding.
     * When widget is removed from this list, this widget is unbinded from this binding.
     * @param widgets - The list of the widgets involved in the bindings.
     * @returns A clone of the current builder to chain the building configuration.
     */
    on(...widgets: ReadonlyArray<EventTarget>): BaseBinderBuilder;

    /**
     * Specifies the node which children will be observed by the binding.
     * The children list is observed by the binding, so that additions and removals
     * from it are managed by the binding.
     * @param node - The node which children will be observed by the binding dynamically.
     * @returns A clone of the current builder to chain the building configuration.
     */
    onDynamic(node: Node): BaseBinderBuilder;

    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * @param whenPredicate - The predicate that checks whether the command can be initialised, updated, or executed.
     * @returns A clone of the current builder to chain the building configuration.
     */
    when(whenPredicate: () => boolean): BaseBinderBuilder;

    /**
     * Defines actions to perform with a binding ends.
     * @param endFct - The command to execute on each binding end.
     * @returns A clone of the current builder to chain the building configuration.
     */
    end(endFct: () => void): BaseBinderBuilder;

    /**
     * Specifies the logging level to use.
     * Several call to 'log' can be done to log different parts:
     * log(LogLevel.INTERACTION).log(LogLevel.COMMAND)
     * @param level - The logging level to use.
     * @returns A clone of the current builder to chain the building configuration.
     */
    log(...level: ReadonlyArray<LogLevel>): BaseBinderBuilder;

    /**
     * If called, all the events the interaction will process will be consumed and
     * not progagated to next listeners.
     * @returns A clone of the current builder to chain the building configuration.
     */
    stopImmediatePropagation(): BaseBinderBuilder;

    /**
     * The default behavior associated to the event will be ignored.
     */
    preventDefault(): BaseBinderBuilder;
}
