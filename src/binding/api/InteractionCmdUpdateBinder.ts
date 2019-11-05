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

export interface InteractionCmdUpdateBinder<C extends Command, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionCmdBinder<C, I, D>, CmdUpdateBinderBuilder<C>, InteractionUpdateBinderBuilder<I, D> {
    /**
    * Specifies the update of the command on interaction command.
    * @param update The callback method that updates the action.
    * This callback takes as arguments the command to update and the ongoing interactions (and its parameters).
    * @return The builder to chain the building configuration.
    */
    then(initCmdFct: (c: C, i?: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    continuousExecution(): InteractionCmdUpdateBinder<C, I, D>;

    strictStart(): InteractionCmdUpdateBinder<C, I, D>;

    throttle(timeout: number): InteractionCmdUpdateBinder<C, I, D>;

    first(initCmdFct: (c: C, i?: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    on(...widgets: Array<EventTarget>): InteractionCmdUpdateBinder<C, I, D>;

    log(...level: Array<LogLevel>): InteractionCmdUpdateBinder<C, I, D>;

    // async(): InteractionCmdUpdateBinder<C, I, D>;

    // help(): InteractionCmdUpdateBinder<C, I, D>;

    cancel(cancel: (i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    endOrCancel(endOrCancel: (i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    when(whenPredicate: (i?: D) => boolean): InteractionCmdUpdateBinder<C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    end(onEnd: (c?: C, i?: D) => void): InteractionCmdUpdateBinder<C, I, D>;

    bind(): WidgetBinding<C, I, D>;
}
