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
import {KeyInteractionBinderBuilder} from "./KeyInteractionBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {Command} from "../command/Command";
import {KeyInteractionCmdBinder} from "./KeyInteractionCmdBinder";
import {Interaction} from "../interaction/Interaction";

export interface KeyInteractionBinder<I extends Interaction<D>, D extends InteractionData>
    extends KeyInteractionBinderBuilder<I, D> {

    when(whenPredicate: (i: D) => boolean): KeyInteractionBinder<I, D>;

    on(widget: EventTarget, ...widgets: ReadonlyArray<EventTarget>): KeyInteractionBinder<I, D>;

    onDynamic(node: Node): KeyInteractionBinder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionBinder<I, D>;

    end(endFct: () => void): KeyInteractionBinder<I, D>;

    with(...codes: ReadonlyArray<string>): KeyInteractionBinder<I, D>;

    stopImmediatePropagation(): KeyInteractionBinder<I, D>;

    preventDefault(): KeyInteractionBinder<I, D>;

    toProduce<C extends Command>(cmdSupplier: (i: D) => C): KeyInteractionCmdBinder<C, I, D>;
}
