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
import {CmdBinderBuilder} from "./CmdBinderBuilder";
import {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {NodeWidget, Widget} from "./BaseBinderBuilder";

/**
 * The binding builder API already knows the type of UI command
 * the bindings will produce. Routines related to interactions that can be updated are provided (then).
 * @typeParam C - The type of the produced UI Commands
 */
export interface CmdUpdateBinderBuilder<C extends Command> extends CmdBinderBuilder<C>, BaseUpdateBinderBuilder {
    /**
     * Specifies the update of the command on interaction updates.
     * @param update - The callback method that updates the command.
     * This callback takes as arguments the command to update.
     * @returns A clone of the current builder to chain the building configuration.
     */
    then(update: (c: C) => void): CmdUpdateBinderBuilder<C>;

    continuousExecution(): CmdUpdateBinderBuilder<C>;

    strictStart(): CmdUpdateBinderBuilder<C>;

    throttle(timeout: number): CmdUpdateBinderBuilder<C>;

    first(initCmdFct: (c: C) => void): CmdUpdateBinderBuilder<C>;

    on(widget: Widget | ReadonlyArray<Widget>, ...widgets: ReadonlyArray<Widget>): CmdUpdateBinderBuilder<C>;

    onDynamic(node: NodeWidget): CmdUpdateBinderBuilder<C>;

    end(onEnd: (c: C) => void): CmdUpdateBinderBuilder<C>;

    when(whenPredicate: () => boolean): CmdUpdateBinderBuilder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdUpdateBinderBuilder<C>;

    stopImmediatePropagation(): CmdUpdateBinderBuilder<C>;

    preventDefault(): CmdUpdateBinderBuilder<C>;
}
