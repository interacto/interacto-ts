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

import {UpdateBinder} from "./UpdateBinder";
import {CommandImpl} from "../command/CommandImpl";
import {FSM} from "../fsm/FSM";
import {InteractionData} from "../interaction/InteractionData";
import {MArray} from "../util/ArrayUtil";
import { InteractionImpl } from "../interaction/InteractionImpl";

export class SourceTargetBinder<C extends CommandImpl, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData,
    B extends SourceTargetBinder<C, I, D, B>> extends UpdateBinder<C, I, D, B> {

    public constructor(interaction: I, cmdProducer: (i?: D) => C) {
        super(interaction, cmdProducer);
    }

    public to(widget: EventTarget) {
        if (this.targetWidgets === undefined) {
            this.targetWidgets = new MArray<EventTarget>();
        }
        this.targetWidgets.push(widget);
        return this as {} as B;
    }

}
