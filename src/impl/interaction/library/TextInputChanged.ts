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

import {isTextInput} from "../../fsm/Events";
import {FSMImpl} from "../../fsm/FSMImpl";
import {TextInputChangedTransition} from "../../fsm/TextInputChangedTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

class TextInputChangedFSM extends FSMImpl<TextInputChangedHandler> {
    /** The time gap between the two spinner events. */
    private readonly _timeGap: number = 1000;

    /**
     * The supplier that provides the time gap.
     * @returns The time gap
     */
    private readonly timeGapSupplier: () => number = () => this.getTimeGap();

    /**
     * @returns The time gap between the two spinner events.
     */
    public getTimeGap(): number {
        return this._timeGap;
    }

    public constructor(logger: Logger, dataHandler: TextInputChangedHandler, timeSet?: number) {
        super(logger, dataHandler);
        if (timeSet !== undefined) {
            this._timeGap = timeSet;
        }

        const changed = this.addStdState("changed");

        new TextInputChangedTransition(this.initState, changed,
            (evt: Event): void => {
                this.dataHandler?.initToChangedHandler(evt);
            });

        new TextInputChangedTransition(changed, changed,
            (evt: Event): void => {
                this.dataHandler?.initToChangedHandler(evt);
            });

        new TimeoutTransition(changed, this.addTerminalState("ended"), this.timeGapSupplier);
    }
}

interface TextInputChangedHandler extends FSMDataHandler {
    initToChangedHandler(event: Event): void;
}

/**
 * A user interaction for Number input.
 * @category Interaction Library
 */
export class TextInputChanged extends InteractionBase<WidgetData<HTMLInputElement | HTMLTextAreaElement>,
    WidgetDataImpl<HTMLInputElement | HTMLTextAreaElement>> {

    public constructor(logger: Logger, timeGap?: number, name?: string) {
        const handler: TextInputChangedHandler = {
            "initToChangedHandler": (event: Event): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new TextInputChangedFSM(logger, handler, timeGap),
            new WidgetDataImpl<HTMLInputElement | HTMLTextAreaElement>(), logger, name ?? TextInputChanged.name);
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
