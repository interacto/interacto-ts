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
import type {BaseBinder} from "./BaseBinder";
import type {Widget} from "./BaseBinderBuilder";
import type {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";
import type {CmdUpdateBinder} from "./CmdUpdateBinder";
import type {InteractionUpdateBinder} from "./InteractionUpdateBinder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The base interface for building bindings based on non-trivial user interactions (eg DnD) with routines
 * for defining the UI command and the user interaction to use.
 * @category Helper
 */
export interface BaseUpdateBinder extends BaseUpdateBinderBuilder, BaseBinder {
    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): BaseUpdateBinder;

    onDynamic(node: Widget<Node>): BaseUpdateBinder;

    when(fn: () => boolean, mode?: WhenType): BaseUpdateBinder;

    end(fn: () => void): BaseUpdateBinder;

    log(...level: ReadonlyArray<LogLevel>): BaseUpdateBinder;

    continuousExecution(): BaseUpdateBinder;

    throttle(timeout: number): BaseUpdateBinder;

    toProduce<C extends Command>(fn: () => C): CmdUpdateBinder<C>;

    toProduceAnon(fn: () => void): CmdUpdateBinder<Command>;

    // eslint-disable-next-line no-use-before-define
    usingInteraction<I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
    (fn: () => I): InteractionUpdateBinder<I, A, D>;

    stopImmediatePropagation(): BaseUpdateBinder;

    preventDefault(): BaseUpdateBinder;

    catch(fn: (ex: unknown) => void): BaseUpdateBinder;

    name(name: string): BaseUpdateBinder;

    configureRules(ruleName: RuleName, severity: Severity): BaseUpdateBinder;
}
