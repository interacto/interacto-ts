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
import {isTextInput} from "../../fsm/Events";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import {StdState} from "../../fsm/StdState";
import {TextInputChangedTransition} from "../../fsm/TextInputChangedTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";

class TextInputChangedFSM extends FSMImpl<TextInputChangedHandler> {
    /** The time gap between the two spinner events. */
    private readonly _timeGap: number = 1000;

    /** The supplier that provides the time gap. */
    private readonly timeGapSupplier: () => number = () => this.getTimeGap();

    /**
     * @returns The time gap between the two spinner events.
     */
    public getTimeGap(): number {
        return this._timeGap;
    }

    public constructor(dataHandler: TextInputChangedHandler, timeSet?: number) {
        super(dataHandler);
        if (timeSet !== undefined) {
            this._timeGap = timeSet;
        }

        const changed: StdState = new StdState(this, "changed");
        const ended: TerminalState = new TerminalState(this, "ended");
        this.addState(changed);
        this.addState(ended);

        const trInit = new TextInputChangedTransition(this.initState, changed);
        trInit.action = (event: Event): void => {
            this.dataHandler?.initToChangedHandler(event);
        };

        const trChanged = new TextInputChangedTransition(changed, changed);
        trChanged.action = (event: Event): void => {
            this.dataHandler?.initToChangedHandler(event);
        };

        new TimeoutTransition(changed, ended, this.timeGapSupplier);
    }
}


interface TextInputChangedHandler extends FSMDataHandler {
    initToChangedHandler(event: Event): void;
}

/**
 * A user interaction for Number input.
 */
export class TextInputChanged extends InteractionBase<WidgetData<HTMLInputElement | HTMLTextAreaElement>,
WidgetDataImpl<HTMLInputElement | HTMLTextAreaElement>, TextInputChangedFSM> {

    public constructor(timeGap?: number) {
        const handler: TextInputChangedHandler = {
            "initToChangedHandler": (event: Event): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new TextInputChangedFSM(handler, timeGap), new WidgetDataImpl<HTMLInputElement | HTMLTextAreaElement>());
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isTextInput(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isTextInput(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
