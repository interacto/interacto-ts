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
import {WidgetData, WidgetDataImpl} from "./WidgetData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";

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
        tr.action = (event: Event): void => {
            if (event.target !== null && isButton(event.target) && dataHandler !== undefined) {
                dataHandler.initToPressedHandler(event);
            }
        };
    }
}

interface ButtonPressedFSMHandler extends FSMDataHandler {
    initToPressedHandler(event: Event): void;
}

/**
 * A user interaction for buttons.
 * @author Arnaud BLOUIN
 */
export class ButtonPressed extends InteractionBase<WidgetData<HTMLButtonElement>, ButtonPressedFSM> {
    private readonly handler: ButtonPressedFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new ButtonPressedFSM());

        this.handler = {
            "initToPressedHandler": (event: Event): void => {
                if (event.target !== null && isButton(event.target)) {
                    (this.data as WidgetDataImpl<HTMLButtonElement>).setWidget(event.target);
                }
            },
            "reinitData": (): void => this.reinitData()
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

    public createDataObject(): WidgetData<HTMLButtonElement> {
        return new WidgetDataImpl<HTMLButtonElement>();
    }
}
