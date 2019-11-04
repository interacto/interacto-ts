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
import { InteractionData } from "../../interaction/InteractionData";
import { InteractionCmdBinder } from "./InteractionCmdBinder";
import { CmdUpdateBinderBuilder } from "./CmdUpdateBinderBuilder";
import { InteractionUpdateBinderBuilder } from "./InteractionUpdateBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { WidgetBinding } from "../WidgetBinding";
import { FSM } from "../../fsm/FSM";

export interface InteractionCmdUpdateBinder<W, C extends Command, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionCmdBinder<W, C, I, D>, CmdUpdateBinderBuilder<W, C>, InteractionUpdateBinderBuilder<W, I, D> {
    /**
    * Specifies the update of the command on interaction command.
    * @param update The callback method that updates the action.
    * This callback takes as arguments the command to update and the ongoing interactions (and its parameters).
    * @return The builder to chain the building configuration.
    */
    then(initCmdFct: (c: C, i?: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    continuousExecution(): InteractionCmdUpdateBinder<W, C, I, D>;

    strictStart(): InteractionCmdUpdateBinder<W, C, I, D>;

    throttle(timeout: number): InteractionCmdUpdateBinder<W, C, I, D>;

    first(initCmdFct: (c: C, i?: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    on(...widgets: Array<W>): InteractionCmdUpdateBinder<W, C, I, D>;

    log(...level: Array<LogLevel>): InteractionCmdUpdateBinder<W, C, I, D>;

    // async(): InteractionCmdUpdateBinder<W, C, I, D>;

    // help(): InteractionCmdUpdateBinder<W, C, I, D>;

    cancel(cancel: (i: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    endOrCancel(endOrCancel: (i: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    when(whenPredicate: (i?: D) => boolean): InteractionCmdUpdateBinder<W, C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    end(onEnd: (c: C, i?: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;

    bind(): WidgetBinding<C, I, D>;
}
