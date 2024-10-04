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

import {BoxCheckPressedTransition} from "../../fsm/BoxCheckPressedTransition";
import {isCheckBox} from "../../fsm/Events";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import type {Logger} from "../../../api/logging/Logger";

class BoxCheckedFSM extends FSMImpl {
    public constructor(logger: Logger, action: (event: InputEvent) => void) {
        super(logger);
        new BoxCheckPressedTransition(this.initState, this.addTerminalState("checked"), action);
    }
}

/**
 * A user interaction for CheckBox.
 * @category Interaction Library
 */
export class BoxChecked extends InteractionBase<WidgetData<HTMLInputElement>, WidgetDataImpl<HTMLInputElement>> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (event: Event): void => {
            this._data.copy(event);
        };
        super(new BoxCheckedFSM(logger, action), new WidgetDataImpl<HTMLInputElement>(), logger, name ?? BoxChecked.name);
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
