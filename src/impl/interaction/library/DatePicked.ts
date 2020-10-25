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
import {isDatePicker} from "../../fsm/Events";
import {FSMDataHandler} from "../../../api/fsm/FSMDataHandler";
import {WidgetData, WidgetDataImpl} from "../../../api/interaction/WidgetData";
import {DatePickedTransition} from "../../fsm/DatePickedTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";

export class DatePickedFSM extends FSMImpl {
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

        const tr = new DatePickedTransition(this.initState, picked);
        tr.action = (event: Event): void => {
            if (event.target !== null && isDatePicker(event.target) && dataHandler !== undefined) {
                dataHandler.initToPickedHandler(event);
            }
        };
    }
}


interface DatePickedHandler extends FSMDataHandler {
    initToPickedHandler(event: Event): void;
}

/**
 * A user interaction for Date input.
 * @author Gwendal DIDOT
 */

export class DatePicked extends InteractionBase<WidgetData<HTMLInputElement>, DatePickedFSM> {
    private readonly handler: DatePickedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new DatePickedFSM());

        this.handler = {
            "initToPickedHandler": (event: Event): void => {
                if (event.target !== null && isDatePicker(event.target)) {
                    (this.data as WidgetDataImpl<HTMLInputElement>).setWidget(event.target);
                }
            },
            "reinitData": (): void => this.reinitData()
        };

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

    public createDataObject(): WidgetData<HTMLInputElement> {
        return new WidgetDataImpl<HTMLInputElement>();
    }
}
