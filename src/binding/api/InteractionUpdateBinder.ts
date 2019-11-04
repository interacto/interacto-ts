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

export interface InteractionUpdateBinder<W, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionUpdateBinderBuilder<W, I, D> {

    on(...widgets: Array<W>): InteractionUpdateBinder<W, I, D>;

    log(...level: Array<LogLevel>): InteractionUpdateBinder<W, I, D>;

    // async(): InteractionUpdateBinder<W, I, D>;

    // help(): InteractionUpdateBinder<W, I, D>;

    when(whenPredicate: (i?: D) => boolean): InteractionUpdateBinder<W, I, D>;

    end(endFct: () => void): InteractionUpdateBinder<W, I, D>;

    cancel(cancel: (i: D) => void): InteractionUpdateBinder<W, I, D>;

    endOrCancel(endOrCancel: (i: D) => void): InteractionUpdateBinder<W, I, D>;

    toProduce<C extends Command>(cmdSupplier: (c: C, i?: D) => void): InteractionCmdUpdateBinder<W, C, I, D>;
}
