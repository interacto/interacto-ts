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
import type {LogLevel} from "../logging/LogLevel";
import type {Command} from "../command/Command";
import type {KeyInteractionCmdUpdateBinder} from "./KeyInteractionCmdUpdateBinder";
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {KeyBinderBuilder} from "./KeyBinderBuilder";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";

export interface KeyInteractionUpdateBinder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionUpdateBinderBuilder<I, D>, KeyBinderBuilder {

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeyInteractionUpdateBinder<I, D>;

    onDynamic(node: Widget<Node>): KeyInteractionUpdateBinder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionUpdateBinder<I, D>;

    when(fn: (i: D) => boolean): KeyInteractionUpdateBinder<I, D>;

    strictStart(): KeyInteractionUpdateBinder<I, D>;

    with(...codes: ReadonlyArray<string>): KeyInteractionUpdateBinder<I, D>;

    stopImmediatePropagation(): KeyInteractionUpdateBinder<I, D>;

    preventDefault(): KeyInteractionUpdateBinder<I, D>;

    cancel(fn: (i: D) => void): KeyInteractionUpdateBinder<I, D>;

    endOrCancel(fn: (i: D) => void): KeyInteractionUpdateBinder<I, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionUpdateBinder<I, D>;

    toProduce<C extends Command>(fn: (i: D) => C): KeyInteractionCmdUpdateBinder<C, I, D>;
}
