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
import {TerminalState} from "../../fsm/TerminalState";
import {isColorChoice} from "../../fsm/Events";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {WidgetData} from "../../../api/interaction/WidgetData";
import {ColorPickedTransition} from "../../fsm/ColorPickedTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";

export class ColorPickedFSM extends FSMImpl {
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: ColorPickedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const picked: TerminalState = new TerminalState(this, "picked");
        this.addState(picked);

        const tr = new ColorPickedTransition(this.initState, picked);
        tr.action = (event: Event): void => {
            dataHandler?.initToPickedHandler(event);
        };
    }
}


interface ColorPickedHandler extends FSMDataHandler {
    initToPickedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 */

export class ColorPicked extends InteractionBase<WidgetData<HTMLInputElement>, WidgetDataImpl<HTMLInputElement>, ColorPickedFSM> {
    private readonly handler: ColorPickedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new ColorPickedFSM(), new WidgetDataImpl<HTMLInputElement>());

        this.handler = {
            "initToPickedHandler": (event: Event): void => {
                this.data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isColorChoice(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isColorChoice(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
