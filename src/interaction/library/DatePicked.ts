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
import { isDatePicker } from "../../fsm/Events";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { WidgetData } from "../WidgetData";
import { DatePickedTransition } from "../../fsm/DatePickedTransition";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";

export class DatePickedFSM extends FSM {
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: DatePickedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const picked: TerminalState = new TerminalState(this, "picked");
        this.addState(picked);

        new class extends DatePickedTransition {
            public action(event: Event): void {
                if (event.target !== null && isDatePicker(event.target) && dataHandler !== undefined) {
                    dataHandler.initToPickedHandler(event);
                }
            }
        }(this.initState, picked);
    }
}


interface DatePickedHandler extends FSMDataHandler {
    initToPickedHandler(event: Event): void;
}

/**
 * A user interaction for Date input.
 * @author Gwendal DIDOT
 */

export class DatePicked extends InteractionImpl<WidgetData<HTMLInputElement>, DatePickedFSM, HTMLInputElement> {
    private readonly handler: DatePickedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new DatePickedFSM());

        this.handler = new class implements DatePickedHandler {
            private readonly _parent: DatePicked;

            public constructor(parent: DatePicked) {
                this._parent = parent;
            }

            public initToPickedHandler(event: Event): void {
                if (event.target !== null && isDatePicker(event.target)) {
                    this._parent._widget = event.target;
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }

        }(this);

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isDatePicker(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isDatePicker(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }

    public getData(): WidgetData<HTMLInputElement> {
        return this;
    }
}
