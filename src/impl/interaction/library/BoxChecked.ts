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
import {FSMDataHandler} from "../../../api/fsm/FSMDataHandler";
import {WidgetData, WidgetDataImpl} from "../../../api/interaction/WidgetData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {Interaction} from "../../../api/interaction/Interaction";
import {FSM} from "../../../api/fsm/FSM";

export class BoxCheckedFSM extends FSMImpl {

    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: BoxCheckedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const checked: TerminalState = new TerminalState(this, "checked");
        this.addState(checked);

        const tr = new BoxCheckPressedTransition(this.initState, checked);
        tr.action = (event: Event): void => {
            if (event.target !== null && isCheckBox(event.target) && dataHandler !== undefined) {
                dataHandler.initToCheckHandler(event);
            }
        };
    }
}

interface BoxCheckedHandler extends FSMDataHandler {
    initToCheckHandler(event: Event): void;
}

interface IBoxChecked extends Interaction<WidgetData<HTMLInputElement>, FSM> {

}
/**
 * A user interaction for CheckBox.
 * @author Gwendal DIDOT
 */
export class BoxChecked extends InteractionBase<WidgetData<HTMLInputElement>, BoxCheckedFSM> implements IBoxChecked {
    private readonly handler: BoxCheckedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new BoxCheckedFSM());

        this.handler = {
            "initToCheckHandler": (event: Event): void => {
                if (event.target !== null && isCheckBox(event.target)) {
                    (this.data as WidgetDataImpl<HTMLInputElement>).setWidget(event.target);
                }
            },
            "reinitData": (): void => this.reinitData()
        };

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

    public createDataObject(): WidgetData<HTMLInputElement> {
        return new WidgetDataImpl<HTMLInputElement>();
    }
}
