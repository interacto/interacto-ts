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
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {WidgetData} from "../WidgetData";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";

export class BoxCheckedFSM extends FSM {

    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: BoxCheckedHandler): void {
        if (this.states.length > 1) {
            return ;
        }

        super.buildFSM(dataHandler);
        const checked: TerminalState = new TerminalState(this, "checked");
        this.addState(checked);

        new class extends BoxCheckPressedTransition {

            public action(event: Event): void {
                if (event.target !== null && isCheckBox(event.target) && dataHandler !== undefined) {
                    dataHandler.initToCheckHandler(event);
                }
            }
        }(this.initState, checked);
    }
}

export interface BoxCheckedHandler extends FSMDataHandler {
    initToCheckHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox.
 * @author Gwendal DIDOT
 */
export class BoxChecked extends InteractionImpl<WidgetData<Element>, BoxCheckedFSM, Element> {
    private readonly handler: BoxCheckedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
            super(new BoxCheckedFSM());

            this.handler = new class implements BoxCheckedHandler {
                private readonly _parent: BoxChecked;

                constructor(parent: BoxChecked) {
                    this._parent = parent;
                }

                public initToCheckHandler(event: Event): void {
                    if (event.target !== null && isCheckBox(event.target)) {
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
            if (isCheckBox(node)) {
                this.registerActionHandlerInput(node);
            }
        }

        public onNodeUnregistered(node: EventTarget): void {
            if (isCheckBox(node)) {
                this.unregisterActionHandlerInput(node);
            }
        }

        public getData(): WidgetData<Element> {
            return this;
        }
}
