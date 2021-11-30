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
import type {BaseBinderBuilder, Widget} from "./BaseBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binding builder API that already knows the type of UI command the bindings will produce
 * @typeParam C - The type of the produced UI Commands
 */
export interface CmdBinderBuilder<C extends Command> extends BaseBinderBuilder {
    /**
     * Specifies the initialisation of the command when the interaction starts.
     * Each time the interaction starts, an instance of the command is created and configured by the given callback.
     * A binder can have several cummulative 'first' routines.
     * @param fn - The callback method that initialises the command.
     * This callback takes as arguments the command to configure.
     * @returns A clone of the current binder to chain the building configuration.
     */
    first(fn: (c: C) => void): CmdBinderBuilder<C>;

    end(fn: (c: C) => void): CmdBinderBuilder<C>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>): CmdBinderBuilder<C>;

    onDynamic(node: Widget<Node>): CmdBinderBuilder<C>;

    when(fn: () => boolean): CmdBinderBuilder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdBinderBuilder<C>;

    stopImmediatePropagation(): CmdBinderBuilder<C>;

    preventDefault(): CmdBinderBuilder<C>;

    catch(fn: (ex: unknown) => void): CmdBinderBuilder<C>;

    name(name: string): CmdBinderBuilder<C>;
}
