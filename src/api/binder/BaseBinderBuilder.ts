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
import type {LogLevel} from "../logging/LogLevel";

/**
 * For supporting Angular ElementReference without
 * any dependency to Angular.
 */
export interface EltRef<T> {
    nativeElement: T;
}

/**
 * Checks whether the given object matches the EltRef structure.
 * @param o - The object to check
 */
export function isEltRef(o: unknown): o is EltRef<EventTarget> {
    if (o === undefined || o === null) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (o as EltRef<EventTarget>).nativeElement instanceof EventTarget;
}

/**
 * This alias refers to either an EvenTarget object of a reference to an EvenTarget object.
 */
export type Widget<T extends EventTarget> = EltRef<T> | T;

/**
 * The base interface for building bindings.
 */
export interface BaseBinderBuilder {
    /**
     * Specifies the widgets on which the binding must operate.
     * When a widget is added to this list, the added widget is binded to this binding.
     * When widget is removed from this list, this widget is unbinded from this binding.
     * @param widget - The mandatory first widget
     * @param widgets - The list of the widgets involved in the bindings.
     * @returns A clone of the current builder to chain the building configuration.
     */
    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>): BaseBinderBuilder;

    /**
     * Specifies the node which children will be observed by the binding.
     * The children list is observed by the binding, so that additions and removals
     * from it are managed by the binding.
     * @param node - The node which children will be observed by the binding dynamically.
     * @returns A clone of the current builder to chain the building configuration.
     */
    onDynamic(node: Widget<Node>): BaseBinderBuilder;

    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * Several calls to this method can be made to add new conditions that are checked after the previous ones.
     * @param fn - The predicate that checks whether the command can be initialised, updated, or executed.
     * @returns A clone of the current builder to chain the building configuration.
     */
    when(fn: () => boolean): BaseBinderBuilder;

    /**
     * Defines actions to perform with a binding ends.
     * Several calls to this method can be made to add new actions that are executed after the previous ones.
     * @param fn - The command to execute on each binding end.
     * @returns A clone of the current builder to chain the building configuration.
     */
    end(fn: () => void): BaseBinderBuilder;

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
     * not propagated to next listeners.
     * @returns A clone of the current builder to chain the building configuration.
     */
    stopImmediatePropagation(): BaseBinderBuilder;

    /**
     * The default behavior associated to the event will be ignored.
     * @returns A clone of the current builder to chain the building configuration.
     */
    preventDefault(): BaseBinderBuilder;

    /**
     * Allows the processing of errors during the execution of the binding.
     * Errors reported here are errors thrown in arrow functions provided to the
     * the different routines of the binder.
     * Several calls to this method can be made to add new actions that are executed after the previous ones.
     * @param fn - The function to process the error caught by the binding during its execution
     */
    catch(fn: (ex: unknown) => void): BaseBinderBuilder;

    /**
     * Specifies the name of the Interacto binding.
     * This name will be used in the logging system.
     * It should be unique, but no mechanism will check that.
     * @param name - The name of the binding
     */
    name(name: string): BaseBinderBuilder;
}
