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
import {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {Command} from "../command/Command";
import {InteractionCmdBinder} from "./InteractionCmdBinder";
import {Interaction} from "../interaction/Interaction";


export interface InteractionBinder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionBinderBuilder<I, D> {

    when(whenPredicate: (i: D) => boolean): InteractionBinder<I, D>;

    on(...widgets: Array<EventTarget>): InteractionBinder<I, D>;

    onDynamic(node: Node): InteractionBinder<I, D>;

    log(...level: Array<LogLevel>): InteractionBinder<I, D>;

    end(endFct: () => void): InteractionBinder<I, D>;

    stopImmediatePropagation(): InteractionBinder<I, D>;

    preventDefault(): InteractionBinder<I, D>;

    toProduce<C extends Command>(cmdSupplier: (i: D) => C): InteractionCmdBinder<C, I, D>;
}
