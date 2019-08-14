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

import {CommandImpl} from "../command/CommandImpl";
import {AnonNodeBinding} from "./AnonNodeBinding";
import {KeyBinder} from "./KeyBinder";
import {KeysData} from "../interaction/library/KeysData";
import {KeysPressed} from "../interaction/library/KeysPressed";
import { WidgetBindingImpl } from "./WidgetBindingImpl";

export class KeyNodeBinder<C extends CommandImpl> extends KeyBinder<C, KeyNodeBinder<C>> {

    public constructor(cmdPoducer: (i ?: KeysData) => C) {
        super(cmdPoducer);
    }

    public bind(): WidgetBindingImpl<C, KeysPressed, KeysData> {
        return new AnonNodeBinding(false, this.interaction, this.cmdProducer,
            this.initCmd,
            () => {},
            () => this.checkCode,
            this.onEnd,
            () => {},
            () => {},
            () => {},
            this.widgets,
            this.additionalWidgets,
            this.targetWidgets,
            this._async,
            false,
            this.logLevels);
    }
}
