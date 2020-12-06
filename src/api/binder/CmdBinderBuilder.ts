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
import {BaseBinderBuilder} from "./BaseBinderBuilder";
import {LogLevel} from "../logging/LogLevel";

/**
 * The binding builder API already knows the type of UI command
 * the bindings will produce
 * @typeParam C - The type of the produced UI Commands
 */
export interface CmdBinderBuilder<C extends Command> extends BaseBinderBuilder {
    /**
     * Specifies the initialisation of the command when the interaction starts.
     * Each time the interaction starts, an instance of the command is created and configured by the given callback.
     * @param initCmdFct - The callback method that initialises the command.
     * This callback takes as arguments the command to configure.
     * @returns The builder to chain the building configuration.
     */
    first(initCmdFct: (c: C) => void): CmdBinderBuilder<C>;

    end(onEnd: (c: C) => void): CmdBinderBuilder<C>;

    on(widget: EventTarget, ...widgets: ReadonlyArray<EventTarget>): CmdBinderBuilder<C>;

    onDynamic(node: Node): CmdBinderBuilder<C>;

    when(whenPredicate: () => boolean): CmdBinderBuilder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdBinderBuilder<C>;

    stopImmediatePropagation(): CmdBinderBuilder<C>;

    preventDefault(): CmdBinderBuilder<C>;
}
