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

import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {ButtonPressedTransition} from "../../fsm/ButtonPressedTransition";
import {TerminalState} from "../../fsm/TerminalState";
import {isButton} from "../../fsm/Events";
import {WidgetData} from "../../../api/interaction/WidgetData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";

/**
 * The FSM for button pressures.
 */
export class ButtonPressedFSM extends FSMImpl {
    /**
     * Creates the FSM
     */
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: ButtonPressedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");
        this.addState(pressed);

        const tr = new ButtonPressedTransition(this.initState, pressed);
        tr.action = (event: InputEvent): void => {
            dataHandler?.initToPressedHandler(event);
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
    private readonly handler: ButtonPressedFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new ButtonPressedFSM(), new WidgetDataImpl<HTMLButtonElement>());

        this.handler = {
            "initToPressedHandler": (event: InputEvent): void => {
                this.data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isButton(node)) {
            this.registerActionHandlerClick(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isButton(node)) {
            this.unregisterActionHandlerClick(node);
        }
    }
}
