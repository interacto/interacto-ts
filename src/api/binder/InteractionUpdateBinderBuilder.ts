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
import type {InteractionData} from "../interaction/InteractionData";
import type {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";

/**
 * The binding builder API that already knows the type of user interaction the bindings will use
 * (for user interactions that can be updated).
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionUpdateBinderBuilder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionBinderBuilder <I, D>, BaseUpdateBinderBuilder {
    /**
     * Defines what to do when a command is cancelled (because the interaction is cancelled).
     * The undoable command is automatically cancelled so that nothing must be done on the command.
     * A binder can have several cummulative 'cancel' routines.
     * @returns A clone of the current binder to chain the building configuration.
     */
    cancel(fn: (i: D) => void): InteractionUpdateBinderBuilder<I, D>;

    /**
     * Defines what to do when a command is cancelled (because the interaction is cancelled).
     * The undoable command is automatically cancelled so that nothing must be done on the command.
     * A binder can have several cummulative 'endOrCancel' routines.
     * @returns A clone of the current binder to chain the building configuration.
     */
    endOrCancel(fn: (i: D) => void): InteractionUpdateBinderBuilder<I, D>;

    when(fn: (i: D) => boolean): InteractionUpdateBinderBuilder<I, D>;

    end(fn: () => void): InteractionUpdateBinderBuilder<I, D>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    InteractionUpdateBinderBuilder<I, D>;

    onDynamic(node: Widget<Node>): InteractionUpdateBinderBuilder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionUpdateBinderBuilder<I, D>;

    stopImmediatePropagation(): InteractionUpdateBinderBuilder<I, D>;

    throttle(timeout: number): InteractionUpdateBinderBuilder<I, D>;

    continuousExecution(): InteractionUpdateBinderBuilder<I, D>;

    strictStart(): InteractionUpdateBinderBuilder<I, D>;

    preventDefault(): InteractionUpdateBinderBuilder<I, D>;

    catch(fn: (ex: unknown) => void): InteractionUpdateBinderBuilder<I, D>;

    name(name: string): InteractionUpdateBinderBuilder<I, D>;
}
