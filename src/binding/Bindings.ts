/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import { CmdBinder } from "./api/CmdBinder";
import { AnonCmd } from "../command/AnonCmd";
import { AnonCmdBinder } from "./AnonCmdBinder";
import { InteractionBinder } from "./api/InteractionBinder";
import { ButtonPressed } from "../interaction/library/ButtonPressed";
import { WidgetData } from "../interaction/WidgetData";
import { Command } from "../command/Command";
import { UpdateBinder } from "./UpdateBinder";
import { BoxChecked } from "../interaction/library/BoxChecked";

/**
 * Creates binding builder to build a binding between a KeysPressure interaction (done on a Node) and the given command type.
 * Do not forget to call bind() at the end of the build to execute the builder.
 * @param cmd The anonymous command to produce.
 * @return The binding builder. Cannot be null.
 * @throws IllegalArgumentException If the given cmd is null.
 */
export function anonCmdBinder(cmd: () => void): CmdBinder<AnonCmd> {
    return new AnonCmdBinder(cmd);
}

/**
 * Creates binding builder to build a binding between a button interaction and the given command type.
 * Do not forget to call bind() at the end of the build to execute the builder.
 * @return The binding builder. Cannot be null.
 */
export function buttonBinder<C extends Command>(): InteractionBinder<ButtonPressed, WidgetData<Element>> {
    return new UpdateBinder<C, ButtonPressed, WidgetData<Element>>(0, false, false)
        .usingInteraction<ButtonPressed, WidgetData<Element>>(() => new ButtonPressed());
}

export function checkboxBinder<C extends Command>(): InteractionBinder<BoxChecked, WidgetData<Element>> {
    return new UpdateBinder<C, BoxChecked, WidgetData<Element>>(0, false, false)
        .usingInteraction<BoxChecked, WidgetData<Element>>(() => new BoxChecked());
}
