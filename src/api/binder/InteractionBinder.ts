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
import type {Command} from "../command/Command";
import type {InteractionCmdBinder} from "./InteractionCmdBinder";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {AnonCmd} from "../../impl/command/AnonCmd";
import type {WhenType} from "./When";

/**
 * The binder API that already knows the type of user interaction the bindings will use.
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionBinder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionBinderBuilder<I, D> {
    when(fn: (i: D) => boolean, mode?: WhenType): InteractionBinder<I, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): InteractionBinder<I, D>;

    onDynamic(node: Widget<Node>): InteractionBinder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionBinder<I, D>;

    end(fn: () => void): InteractionBinder<I, D>;

    stopImmediatePropagation(): InteractionBinder<I, D>;

    preventDefault(): InteractionBinder<I, D>;

    catch(fn: (ex: unknown) => void): InteractionBinder<I, D>;

    name(name: string): InteractionBinder<I, D>;

    toProduce<C extends Command>(fn: (i: D) => C): InteractionCmdBinder<C, I, D>;

    toProduceAnon(fn: () => void): InteractionCmdBinder<AnonCmd, I, D>;
}
