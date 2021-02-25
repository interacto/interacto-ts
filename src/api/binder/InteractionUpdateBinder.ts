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
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Command} from "../command/Command";
import type {InteractionCmdUpdateBinder} from "./InteractionCmdUpdateBinder";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";

export interface InteractionUpdateBinder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionUpdateBinderBuilder<I, D> {

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    InteractionUpdateBinder<I, D>;

    onDynamic(node: Widget<Node>): InteractionUpdateBinder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionUpdateBinder<I, D>;

    when(fn: (i: D) => boolean): InteractionUpdateBinder<I, D>;

    end(fn: () => void): InteractionUpdateBinder<I, D>;

    cancel(fn: (i: D) => void): InteractionUpdateBinder<I, D>;

    endOrCancel(fn: (i: D) => void): InteractionUpdateBinder<I, D>;

    stopImmediatePropagation(): InteractionUpdateBinder<I, D>;

    preventDefault(): InteractionUpdateBinder<I, D>;

    strictStart(): InteractionUpdateBinder<I, D>;

    catch(fn: (ex: unknown) => void): InteractionUpdateBinder<I, D>;

    toProduce<C extends Command>(fn: (i: D) => C): InteractionCmdUpdateBinder<C, I, D>;
}
