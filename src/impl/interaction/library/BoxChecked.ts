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
import {BoxCheckPressedTransition} from "../../fsm/BoxCheckPressedTransition";
import {isCheckBox} from "../../fsm/Events";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";

export class BoxCheckedFSM extends FSMImpl {

    public constructor() {
        super();
    }

    public override buildFSM(dataHandler?: BoxCheckedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const checked: TerminalState = new TerminalState(this, "checked");
        this.addState(checked);

        const tr = new BoxCheckPressedTransition(this.initState, checked);
        tr.action = (event: InputEvent): void => {
            dataHandler?.initToCheckHandler(event);
        };
    }
}

interface BoxCheckedHandler extends FSMDataHandler {
    initToCheckHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox.
 */
export class BoxChecked extends InteractionBase<WidgetData<HTMLInputElement>, WidgetDataImpl<HTMLInputElement>, BoxCheckedFSM> {
    private readonly handler: BoxCheckedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new BoxCheckedFSM(), new WidgetDataImpl<HTMLInputElement>());

        this.handler = {
            "initToCheckHandler": (event: Event): void => {
                this.data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isCheckBox(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isCheckBox(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
