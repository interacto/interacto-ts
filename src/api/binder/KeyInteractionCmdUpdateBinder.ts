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
import {Binding} from "../binding/Binding";
import {InteractionUpdateBinder} from "./InteractionUpdateBinder";
import {Command} from "../command/Command";
import {Interaction} from "../interaction/Interaction";

export interface KeyInteractionCmdUpdateBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends KeyInteractionBinderBuilder<I, D>, InteractionUpdateBinder<I, D> {

    with(...codes: ReadonlyArray<string>): KeyInteractionCmdUpdateBinder<C, I, D>;

    then(update: ((c: C, i: D) => void) | ((c: C) => void)): KeyInteractionCmdUpdateBinder<C, I, D>;

    continuousExecution(): KeyInteractionCmdUpdateBinder<C, I, D>;

    strictStart(): KeyInteractionCmdUpdateBinder<C, I, D>;

    throttle(timeout: number): KeyInteractionCmdUpdateBinder<C, I, D>;

    first(initCmdFct: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    on(...widgets: ReadonlyArray<EventTarget>): KeyInteractionCmdUpdateBinder<C, I, D>;

    onDynamic(node: Node): KeyInteractionCmdUpdateBinder<C, I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionCmdUpdateBinder<C, I, D>;

    cancel(cancel: (i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    endOrCancel(endOrCancel: (i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    when(whenPredicate: (i: D) => boolean): KeyInteractionCmdUpdateBinder<C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    ifCannotExecute(cannotExec: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    end(onEnd: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    stopImmediatePropagation(): KeyInteractionCmdUpdateBinder<C, I, D>;

    preventDefault(): KeyInteractionCmdUpdateBinder<C, I, D>;

    bind(): Binding<C, I, D>;
}
