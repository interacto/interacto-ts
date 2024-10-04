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

import {DatePickedTransition} from "../../fsm/DatePickedTransition";
import {isDatePicker} from "../../fsm/Events";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import type {Logger} from "../../../api/logging/Logger";

class DatePickedFSM extends FSMImpl {
    public constructor(logger: Logger, action: (event: Event) => void) {
        super(logger);
        new DatePickedTransition(this.initState, this.addTerminalState("picked"), action);
    }
}

/**
 * A user interaction for Date input.
 * @category Interaction Library
 */
export class DatePicked extends InteractionBase<WidgetData<HTMLInputElement>, WidgetDataImpl<HTMLInputElement>> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (event: Event): void => {
            this._data.copy(event);
        };

        super(new DatePickedFSM(logger, action), new WidgetDataImpl<HTMLInputElement>(), logger, name ?? DatePicked.name);
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isDatePicker(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isDatePicker(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
