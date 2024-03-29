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
import type {Widget} from "./BaseBinderBuilder";
import type {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";
import type {CmdBinderBuilder} from "./CmdBinderBuilder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binding builder API that already knows the type of UI command
 * the bindings will produce. Routines related to interactions that can be updated are provided (then).
 * @typeParam C - The type of the produced UI commands
 * @category Helper
 */
export interface CmdUpdateBinderBuilder<C extends Command> extends CmdBinderBuilder<C>, BaseUpdateBinderBuilder {
    /**
     * Permits to update the command on each interaction update.
     * A binder can have several cummulative 'then' routines.
     * This routine is called only if 'when' returns true (ie only if
     * the condition for producing the command is respected).
     * See 'ifCannotExecute' for a 'then' when this condition is not respected.
     * @param fn - The callback method that updates the command.
     * This callback takes as arguments the command to update.
     * @returns A clone of the current binder to chain the building configuration.
     */
    then(fn: (c: C) => void): CmdUpdateBinderBuilder<C>;

    continuousExecution(): CmdUpdateBinderBuilder<C>;

    throttle(timeout: number): CmdUpdateBinderBuilder<C>;

    first(fn: (c: C) => void): CmdUpdateBinderBuilder<C>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): CmdUpdateBinderBuilder<C>;

    onDynamic(node: Widget<Node>): CmdUpdateBinderBuilder<C>;

    end(fn: (c: C) => void): CmdUpdateBinderBuilder<C>;

    when(fn: () => boolean, mode?: WhenType): CmdUpdateBinderBuilder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdUpdateBinderBuilder<C>;

    stopImmediatePropagation(): CmdUpdateBinderBuilder<C>;

    preventDefault(): CmdUpdateBinderBuilder<C>;

    catch(fn: (ex: unknown) => void): CmdUpdateBinderBuilder<C>;

    name(name: string): CmdUpdateBinderBuilder<C>;

    configureRules(ruleName: RuleName, severity: Severity): CmdUpdateBinderBuilder<C>;
}
