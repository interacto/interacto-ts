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
import {Command} from "../command/Command";
import {InteractionData} from "../interaction/InteractionData";
import {KeyInteractionBinderBuilder} from "./KeyInteractionBinderBuilder";
import {InteractionCmdBinder} from "./InteractionCmdBinder";
import {LogLevel} from "../logging/LogLevel";
import {Binding} from "../binding/Binding";
import {Interaction} from "../interaction/Interaction";
import {Widget} from "./BaseBinderBuilder";

export interface KeyInteractionCmdBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends KeyInteractionBinderBuilder<I, D>, InteractionCmdBinder<C, I, D> {

    first(initCmdFct: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    on(widget: Widget<EventTarget> | ReadonlyArray<Widget<EventTarget>>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeyInteractionCmdBinder<C, I, D>;

    onDynamic(node: Widget<Node>): KeyInteractionCmdBinder<C, I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionCmdBinder<C, I, D>;

    when(whenPredicate: (i: D) => boolean): KeyInteractionCmdBinder<C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    ifCannotExecute(cannotExec: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    end(onEnd: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    with(...codes: ReadonlyArray<string>): KeyInteractionCmdBinder<C, I, D>;

    stopImmediatePropagation(): KeyInteractionCmdBinder<C, I, D>;

    preventDefault(): KeyInteractionCmdBinder<C, I, D>;

    bind(): Binding<C, I, D>;
}
