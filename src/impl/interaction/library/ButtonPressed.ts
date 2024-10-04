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

import {ButtonPressedTransition} from "../../fsm/ButtonPressedTransition";
import {isButton} from "../../fsm/Events";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM for button pressures.
 * @category Interaction Library
 */
class ButtonPressedFSM extends FSMImpl {
    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param action - The action to perform on the button pressure.
     */
    public constructor(logger: Logger, action: (evt: InputEvent) => void) {
        super(logger);
        new ButtonPressedTransition(this.initState, this.addTerminalState("pressed"), action);
    }
}

/**
 * A user interaction for buttons.
 * @category Interaction
 */
export class ButtonPressed extends InteractionBase<WidgetData<HTMLButtonElement>, WidgetDataImpl<HTMLButtonElement>> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (event: InputEvent): void => {
            this._data.copy(event);
        };
        super(new ButtonPressedFSM(logger, action), new WidgetDataImpl<HTMLButtonElement>(), logger, name ?? ButtonPressed.name);
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isButton(node)) {
            this.registerActionHandlerClick(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isButton(node)) {
            this.unregisterActionHandlerClick(node);
        }
    }
}
