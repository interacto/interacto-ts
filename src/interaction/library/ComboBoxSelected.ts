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

import { TerminalState } from "../../fsm/TerminalState";
import { isComboBox } from "../../fsm/Events";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { WidgetData } from "../WidgetData";
import { ComboBoxTransition } from "../../fsm/ComboBoxTransition";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";

export class ComboBoxSelectedFSM extends FSM {
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: ComboBoxSelectedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const selected: TerminalState = new TerminalState(this, "selected");
        this.addState(selected);

        new class extends ComboBoxTransition {
            public action(event: Event): void {
                if (event.target !== null && isComboBox(event.target) && dataHandler !== undefined) {
                    dataHandler.initToSelectedHandler(event);
                }
            }
        }(this.initState, selected);
    }
}


export interface ComboBoxSelectedHandler extends FSMDataHandler {
    initToSelectedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 * @author Gwendal DIDOT
 */

export class ComboBoxSelected extends InteractionImpl<WidgetData<Element>, ComboBoxSelectedFSM, Element> {
    private readonly handler: ComboBoxSelectedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new ComboBoxSelectedFSM());

        this.handler = new class implements ComboBoxSelectedHandler {
            private readonly _parent: ComboBoxSelected;

            constructor(parent: ComboBoxSelected) {
                this._parent = parent;
            }

            public initToSelectedHandler(event: Event): void {
                if (event.target !== null && isComboBox(event.target)) {
                    this._parent._widget = event.currentTarget as Element;
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }

        }(this);

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isComboBox(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isComboBox(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }

    public getData(): WidgetData<Element> {
        return this;
    }
}
