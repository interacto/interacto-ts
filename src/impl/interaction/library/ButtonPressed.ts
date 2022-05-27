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

import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {ButtonPressedTransition} from "../../fsm/ButtonPressedTransition";
import {TerminalState} from "../../fsm/TerminalState";
import {isButton} from "../../fsm/Events";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";

/**
 * The FSM for button pressures.
 */
class ButtonPressedFSM extends FSMImpl<ButtonPressedFSMHandler> {
    /**
     * Creates the FSM
     */
    public constructor(dataHandler: ButtonPressedFSMHandler) {
        super(dataHandler);

        const pressed: TerminalState = new TerminalState(this, "pressed");
        this.addState(pressed);

        const tr = new ButtonPressedTransition(this.initState, pressed);
        tr.action = (event: InputEvent): void => {
            this.dataHandler?.initToPressedHandler(event);
        };
    }
}

interface ButtonPressedFSMHandler extends FSMDataHandler {
    initToPressedHandler(event: InputEvent): void;
}

/**
 * A user interaction for buttons.
 */
export class ButtonPressed extends InteractionBase<WidgetData<HTMLButtonElement>, WidgetDataImpl<HTMLButtonElement>, ButtonPressedFSM> {
    /**
     * Creates the interaction.
     */
    public constructor() {
        const handler: ButtonPressedFSMHandler = {
            "initToPressedHandler": (event: InputEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new ButtonPressedFSM(handler), new WidgetDataImpl<HTMLButtonElement>());
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
