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
import { Command } from "../../command/Command";
import { InteractionImpl } from "../../interaction/InteractionImpl";
import { FSM } from "../../fsm/FSM";
import { InteractionData } from "../../interaction/InteractionData";
import { KeyInteractionBinderBuilder } from "./KeyInteractionBinderBuilder";
import { InteractionCmdBinder } from "./InteractionCmdBinder";
import { LogLevel } from "../../logging/LogLevel";
import { KeyCode } from "../../fsm/Events";
import { WidgetBinding } from "../WidgetBinding";

export interface KeyInteractionCmdBinder<W, C extends Command, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends KeyInteractionBinderBuilder<W, I, D>, InteractionCmdBinder<W, C, I, D> {

    first(initCmdFct: (c: C, i?: D) => void): KeyInteractionCmdBinder<W, C, I, D>;

    on(...widgets: Array<W>): KeyInteractionCmdBinder<W, C, I, D>;

    log(...level: Array<LogLevel>): KeyInteractionCmdBinder<W, C, I, D>;

    // async(): KeyInteractionCmdBinder<W, C, I, D>;

    // help(): KeyInteractionCmdBinder<W, C, I, D>;

    when(whenPredicate: (i?: D) => boolean): KeyInteractionCmdBinder<W, C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): KeyInteractionCmdBinder<W, C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): KeyInteractionCmdBinder<W, C, I, D>;

    end(onEnd: (c: C, i?: D) => void): KeyInteractionCmdBinder<W, C, I, D>;

    with(...codes: Array<KeyCode>): KeyInteractionCmdBinder<W, C, I, D>;

    bind(): WidgetBinding<C, I, D>;
}
