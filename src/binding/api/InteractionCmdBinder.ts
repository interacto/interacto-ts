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
import { CmdBinderBuilder } from "./CmdBinderBuilder";
import { InteractionBinderBuilder } from "./InteractionBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { WidgetBinding } from "../WidgetBinding";

export interface InteractionCmdBinder<C extends Command, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends CmdBinderBuilder<C>, InteractionBinderBuilder<I, D> {
    /**
    * Specifies the initialisation of the command when the interaction starts.
    * Each time the interaction starts, an instance of the command is created and configured by the given callback.
    * @param initCmdFct The callback method that initialises the command.
    * This callback takes as arguments both the command and interaction involved in the binding.
    * @return The builder to chain the building configuration.
    */
    first(initCmdFct: (c: C, i?: D) => void): InteractionCmdBinder<C, I, D>;

    ifHadEffects(hadEffectFct: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    ifHadNoEffect(noEffectFct: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    /**
    * Specifies what to do end when an interaction ends (when the last event of the interaction has occurred, but just after
    * the interaction is reinitialised and the command finally executed and discarded / saved).
    * @param onEnd The callback method to specify what to do when an interaction ends.
    * @return The builder to chain the building configuration.
    */
    end(onEnd: (c?: C, i?: D) => void): InteractionCmdBinder<C, I, D>;

    on(...widgets: Array<EventTarget>): InteractionCmdBinder<C, I, D>;

    log(...level: Array<LogLevel>): InteractionCmdBinder<C, I, D>;

    // async(): InteractionCmdBinder<C, I, D>;

    // help(): InteractionCmdBinder<C, I, D>;

    when(whenPredicate: (i?: D) => boolean): InteractionCmdBinder<C, I, D>;


    /**
    * Executes the builder to create and install the binding on the instrument.
    */
    bind(): WidgetBinding<C, I, D>;
}
