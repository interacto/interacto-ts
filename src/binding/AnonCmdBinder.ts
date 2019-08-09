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

import {TSInteraction} from "../interaction/TSInteraction";
import {FSM} from "../src-core/fsm/FSM";
import {Binder} from "./Binder";
import {TSWidgetBinding} from "./TSWidgetBinding";
import {AnonNodeBinding} from "./AnonNodeBinding";
import {AnonCmd} from "../src-core/command/AnonCmd";
import {InteractionData} from "../src-core/interaction/InteractionData";

export class AnonCmdBinder<I extends TSInteraction<D, FSM<Event>, {}>, D extends InteractionData>
            extends Binder<AnonCmd, I, D, AnonCmdBinder<I, D>> {

    public constructor(interaction: I, anonCmd: () => void) {
        super(interaction, () => new AnonCmd(anonCmd));
    }

    public bind(): TSWidgetBinding<AnonCmd, I, D> {
        return new AnonNodeBinding(false, this.interaction, this.cmdProducer, () => {},
            () => {}, this.checkConditions, this.onEnd, () => {}, () => {}, () => {},
            this.widgets, this.additionalWidgets, this.targetWidgets, this._async, false, new Array(...this.logLevels));
    }
}
