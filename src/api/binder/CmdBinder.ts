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
import type {CmdBinderBuilder} from "./CmdBinderBuilder";
import type {InteractionCmdBinder} from "./InteractionCmdBinder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binder API that already knows the type of UI command
 * the bindings will produce.
 * @typeParam C - The type of the produced UI Commands
 * @category Helper
 */
export interface CmdBinder<C extends Command> extends CmdBinderBuilder<C> {
    first(fn: (c: C) => void): CmdBinder<C>;

    end(fn: (c: C) => void): CmdBinder<C>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): CmdBinder<C>;

    onDynamic(node: Widget<Node>): CmdBinder<C>;

    when(fn: () => boolean, mode?: WhenType): CmdBinder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdBinder<C>;

    /**
     * Defines how to create the user interaction that the binding will use to create UI commands.
     * @param fn - The supplier that will return a new user interaction.
     * @returns A clone of the current binder to chain the building configuration.
     * @typeParam D - The user interaction data type
     * @typeParam I - The user interaction type
     */
    // eslint-disable-next-line no-use-before-define
    usingInteraction<I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
    (fn: () => I): InteractionCmdBinder<C, I, A, D>;

    stopImmediatePropagation(): CmdBinder<C>;

    preventDefault(): CmdBinder<C>;

    catch(fn: (ex: unknown) => void): CmdBinder<C>;

    name(name: string): CmdBinder<C>;

    configureRules(ruleName: RuleName, severity: Severity): CmdBinder<C>;
}
