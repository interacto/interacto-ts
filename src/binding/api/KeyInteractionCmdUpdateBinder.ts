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

import {InteractionBase} from "../../interaction/InteractionBase";
import {FSM} from "../../fsm/FSM";
import {InteractionData} from "../../interaction/InteractionData";
import {KeyInteractionBinderBuilder} from "./KeyInteractionBinderBuilder";
import {LogLevel} from "../../logging/LogLevel";
import {WidgetBinding} from "../WidgetBinding";
import {InteractionUpdateBinder} from "./InteractionUpdateBinder";
import {Command} from "../../command/Command";

export interface KeyInteractionCmdUpdateBinder<C extends Command, I extends InteractionBase<D, FSM>, D extends InteractionData>
    extends KeyInteractionBinderBuilder<I, D>, InteractionUpdateBinder<I, D> {

    with(...codes: Array<string>): KeyInteractionCmdUpdateBinder<C, I, D>;

    then(update: ((c: C, i: D) => void) | ((c: C) => void)): KeyInteractionCmdUpdateBinder<C, I, D>;

    continuousExecution(): KeyInteractionCmdUpdateBinder<C, I, D>;

    strictStart(): KeyInteractionCmdUpdateBinder<C, I, D>;

    throttle(timeout: number): KeyInteractionCmdUpdateBinder<C, I, D>;

    first(initCmdFct: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    on(...widgets: Array<EventTarget>): KeyInteractionCmdUpdateBinder<C, I, D>;

    onDynamic(node: Node): KeyInteractionCmdUpdateBinder<C, I, D>;

    log(...level: Array<LogLevel>): KeyInteractionCmdUpdateBinder<C, I, D>;

    cancel(cancel: (i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    endOrCancel(endOrCancel: (i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    when(whenPredicate: (i: D) => boolean): KeyInteractionCmdUpdateBinder<C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    end(onEnd: (c: C, i: D) => void): KeyInteractionCmdUpdateBinder<C, I, D>;

    stopImmediatePropagation(): KeyInteractionCmdUpdateBinder<C, I, D>;

    preventDefault(): KeyInteractionCmdUpdateBinder<C, I, D>;

    bind(): WidgetBinding<C, I, D>;
}
