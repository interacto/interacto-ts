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

import { FSM } from "../fsm/FSM";
import { UpdateBinder } from "./UpdateBinder";
import { CommandImpl } from "../command/CommandImpl";
import { InteractionData } from "../interaction/InteractionData";
import { InteractionImpl } from "../interaction/InteractionImpl";

/**
 * The binding builder to create bindings between a given user interaction on a node and a given command.
 * @param <C> The type of the command to produce.
 * @param <I> The type of the user interaction to bind.
 * @author Arnaud Blouin
 */
export class NodeBinder<C extends CommandImpl, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
    extends UpdateBinder<C, I, D, NodeBinder<C, I, D>> {
    public constructor(interaction: I, cmdProducer: (i?: D) => C) {
        super(interaction, cmdProducer);
    }
}
