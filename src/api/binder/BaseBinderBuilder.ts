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
import type {RuleName, Severity} from "../binding/Linting";
import type {LogLevel} from "../logging/LogLevel";
import type {WhenType} from "./When";

/**
 * For supporting Angular ElementReference without any dependency to Angular.
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
    return (o as EltRef<unknown>).nativeElement instanceof EventTarget;
}

/**
 * This alias refers to either an EvenTarget object or a reference to an EvenTarget object.
 */
export type Widget<T> = EltRef<T> | T;

/**
 * The base interface for building bindings (what we call in Interacto a binder).
 */
export interface BaseBinderBuilder {
    /**
     * Specifies the widgets on which the binding will operate.
     * When a widget is added to this list, this widget is binded to this binding.
     * When widget is removed from this list, this widget is unbinded from this binding.
     * @param widget - The mandatory first widget
     * @param widgets - The list of the widgets involved in the bindings.
     * @returns A clone of the current binder to chain the building configuration.
     */
    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): BaseBinderBuilder;

    /**
     * Specifies the node the binding will observe its children.
     * The binding observes its children list, so that additions and removals from it are managed by the binding.
     * @param node - The binding will observe the children of this node.
     * @returns A clone of the current binder to chain the building configuration.
     */
    onDynamic(node: Widget<Node>): BaseBinderBuilder;

    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * A binder can have several cummulative 'when' routines.
     * @param fn - The predicate that checks whether the command can be initialised, updated, or executed.
     * @param mode -- The execution mode of the 'when' predicate. If not defined, the non-strict mode will be used.
     * @returns A clone of the current binder to chain the building configuration.
     */
    when(fn: () => boolean, mode?: WhenType): BaseBinderBuilder;

    /**
     * Defines actions to perform when a binding ends.
     * A binder can have several cummulative 'end' routines.
     * @param fn - The command to execute on each binding end.
     * @returns A clone of the current builder to chain the building configuration.
     */
    end(fn: () => void): BaseBinderBuilder;

    /**
     * Specifies the logging level to use.
     * A binder can have several cummulative 'log' routines, eg:
     * log(LogLevel.INTERACTION).log(LogLevel.COMMAND)
     * @param level - The logging level to use.
     * @returns A clone of the current binder to chain the building configuration.
     */
    log(...level: ReadonlyArray<LogLevel>): BaseBinderBuilder;

    /**
     * If called, all the events the interaction will process will be consumed and
     * not propagated to next listeners.
     * @returns A clone of the current binder to chain the building configuration.
     */
    stopImmediatePropagation(): BaseBinderBuilder;

    /**
     * The default behavior associated to the event will be ignored.
     * @returns A clone of the current binder to chain the building configuration.
     */
    preventDefault(): BaseBinderBuilder;

    /**
     * Allows the processing of errors during the execution of the binding.
     * Errors reported here are errors thrown in arrow functions provided to the
     * the different routines of the binder and errors triggered by the command.
     * A binder can have several cummulative 'catch' routines.
     * @param fn - The function to process the error caught by the binding during its execution
     * @returns A clone of the current binder to chain the building configuration.
     */
    catch(fn: (ex: unknown) => void): BaseBinderBuilder;

    /**
     * Specifies the name of the Interacto binding.
     * This name will be used in the logging system.
     * It should be unique, but no mechanism will check that.
     * @param name - The name of the binding
     * @returns A clone of the current binder to chain the building configuration.
     */
    name(name: string): BaseBinderBuilder;

    /**
     * Configures a linter rule specifically for the binding.
     * @param ruleName - The name of the rule.
     * @param severity - The severity level of the rule.
     * @returns A clone of the current binder to chain the building configuration.
     */
    configureRules(ruleName: RuleName, severity: Severity): BaseBinderBuilder;
}
