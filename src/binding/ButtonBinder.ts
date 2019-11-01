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

import { ButtonPressed } from "../interaction/library/ButtonPressed";
import { CommandImpl } from "../command/CommandImpl";
import { WidgetData } from "../interaction/WidgetData";
import { Binder } from "./Binder";


/**
 * The binding builder to create bindings between a button interaction and a given command.
 * @param <A> The type of the command to produce.
 * @author Arnaud Blouin
 */
export class ButtonBinder<C extends CommandImpl> extends Binder<C, ButtonPressed, WidgetData<Element>, ButtonBinder<C>> {
    public constructor(cmd: (i?: WidgetData<Element>) => C) {
        super(new ButtonPressed(), cmd);
    }
}
