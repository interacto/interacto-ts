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
import { InteractionImpl } from "../../interaction/InteractionImpl";
import { FSM } from "../../fsm/FSM";
import { InteractionData } from "../../interaction/InteractionData";
import { InteractionUpdateBinderBuilder } from "./InteractionUpdateBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { Command } from "../../command/Command";
import { InteractionCmdUpdateBinder } from "./InteractionCmdUpdateBinder";

export interface InteractionUpdateBinder<I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionUpdateBinderBuilder<I, D> {

    on(...widgets: Array<EventTarget>): InteractionUpdateBinder<I, D>;

    log(...level: Array<LogLevel>): InteractionUpdateBinder<I, D>;

    // async(): InteractionUpdateBinder<I, D>;

    // help(): InteractionUpdateBinder<I, D>;

    when(whenPredicate: (i?: D) => boolean): InteractionUpdateBinder<I, D>;

    end(endFct: () => void): InteractionUpdateBinder<I, D>;

    cancel(cancel: (i: D) => void): InteractionUpdateBinder<I, D>;

    endOrCancel(endOrCancel: (i: D) => void): InteractionUpdateBinder<I, D>;

    toProduce<C extends Command>(cmdSupplier: (c: C, i?: D) => void): InteractionCmdUpdateBinder<C, I, D>;
}
