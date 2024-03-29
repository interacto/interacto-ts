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
import type {BaseBinderBuilder, Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";
import type {RuleName, Severity} from "../checker/Checker";
import type {LogLevel} from "../logging/LogLevel";

/**
 * The base interface for building bindings based on non-trivial user interactions (eg DnD).
 * @category Helper
 */
export interface BaseUpdateBinderBuilder extends BaseBinderBuilder {
    /**
     * Specifies whether the command must be executed on each evolution of the interaction (if 'when' predicate is ok).
     * @returns A clone of the current binder to chain the building configuration.
     */
    continuousExecution(): BaseUpdateBinderBuilder;

    /**
     * Backpressure operation. Instead of emitting all the events, successive events of the same type are factorized modulo a timeout.
     * The timeout is used to send at max one event of the same type in a given duration (the timeout).
     * For example with three mouse moves and a time out of 10ms.
     * The first move is received and processed. The timer starts. A second mouse moves is received at T+5ms.
     * It is for the moment not processed. A third mouse move is received at T+8ms. The second move is finally ignored
     * and this third one not processed yet.
     * At T+10s the third event is finally processed.
     * Based on our own experiments, the given timeout value should be greater than 10ms to throttle some UI events.
     * @param timeout - The timeout used by the throttle operation. In ms.
     * @returns A clone of the current binder to chain the building configuration.
     */
    throttle(timeout: number): BaseUpdateBinderBuilder;

    when(fn: () => boolean, mode?: WhenType): BaseUpdateBinderBuilder;

    end(fn: () => void): BaseUpdateBinderBuilder;

    log(...level: ReadonlyArray<LogLevel>): BaseUpdateBinderBuilder;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): BaseUpdateBinderBuilder;

    onDynamic(node: Widget<Node>): BaseUpdateBinderBuilder;

    stopImmediatePropagation(): BaseUpdateBinderBuilder;

    preventDefault(): BaseUpdateBinderBuilder;

    catch(fn: (ex: unknown) => void): BaseUpdateBinderBuilder;

    name(name: string): BaseUpdateBinderBuilder;

    configureRules(ruleName: RuleName, severity: Severity): BaseUpdateBinderBuilder;
}
