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

import {InteractionData} from "../interaction/InteractionData";
import {LogLevel} from "../logging/LogLevel";
import {Command} from "../command/Command";
import {KeyInteractionCmdUpdateBinder} from "./KeyInteractionCmdUpdateBinder";
import {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import {KeyBinderBuilder} from "./KeyBinderBuilder";
import {Interaction} from "../interaction/Interaction";

export interface KeyInteractionUpdateBinder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionUpdateBinderBuilder<I, D>, KeyBinderBuilder {

    on(widget: EventTarget, ...widgets: ReadonlyArray<EventTarget>): KeyInteractionUpdateBinder<I, D>;

    onDynamic(node: Node): KeyInteractionUpdateBinder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionUpdateBinder<I, D>;

    when(whenPredicate: (i: D) => boolean): KeyInteractionUpdateBinder<I, D>;

    strictStart(): KeyInteractionUpdateBinder<I, D>;

    with(...codes: ReadonlyArray<string>): KeyInteractionUpdateBinder<I, D>;

    stopImmediatePropagation(): KeyInteractionUpdateBinder<I, D>;

    preventDefault(): KeyInteractionUpdateBinder<I, D>;

    cancel(cancel: (i: D) => void): KeyInteractionUpdateBinder<I, D>;

    endOrCancel(endOrCancel: (i: D) => void): KeyInteractionUpdateBinder<I, D>;

    toProduce<C extends Command>(cmdSupplier: (i: D) => C): KeyInteractionCmdUpdateBinder<C, I, D>;
}
