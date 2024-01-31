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
import type {CmdUpdateBinderBuilder} from "./CmdUpdateBinderBuilder";
import type {InteractionCmdUpdateBinder} from "./InteractionCmdUpdateBinder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {InteractionData} from "../interaction/InteractionData";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The binder API that already knows the type of UI command
 * the bindings will produce. Routines related to interactions that can be updated are provided ('then').
 * @typeParam C - The type of the produced UI commands
 * @category Helper
 */
export interface CmdUpdateBinder<C extends Command> extends CmdUpdateBinderBuilder<C> {
    then(fn: (c: C) => void): CmdUpdateBinder<C>;

    continuousExecution(): CmdUpdateBinder<C>;

    throttle(timeout: number): CmdUpdateBinder<C>;

    first(fn: (c: C) => void): CmdUpdateBinder<C>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): CmdUpdateBinder<C>;

    onDynamic(node: Widget<Node>): CmdUpdateBinder<C>;

    when(fn: () => boolean, mode?: WhenType): CmdUpdateBinder<C>;

    log(...level: ReadonlyArray<LogLevel>): CmdUpdateBinder<C>;

    end(fn: (c: C) => void): CmdUpdateBinder<C>;

    usingInteraction<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    (fn: () => I): InteractionCmdUpdateBinder<C, I, A, D>;

    stopImmediatePropagation(): CmdUpdateBinder<C>;

    preventDefault(): CmdUpdateBinder<C>;

    catch(fn: (ex: unknown) => void): CmdUpdateBinder<C>;

    name(name: string): CmdUpdateBinder<C>;

    configureRules(ruleName: RuleName, severity: Severity): CmdUpdateBinder<C>;
}
