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

import {isSpinner} from "../../fsm/Events";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import {SpinnerChangedTransition} from "../../fsm/SpinnerChangedTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {Logger} from "../../../api/logging/Logger";

export class SpinnerChangedFSM extends FSMImpl<SpinnerChangedHandler> {
    /** The time gap between the two spinner events. */
    private static timeGap = 300;

    /** The supplier that provides the time gap. */
    private static readonly timeGapSupplier: () => number = () => SpinnerChangedFSM.getTimeGap();

    /**
     * @returns The time gap between the two spinner events.
     */
    public static getTimeGap(): number {
        return SpinnerChangedFSM.timeGap;
    }

    /**
     * Sets The time gap between the two spinner events.
     * @param timeGapBetweenClicks - The time gap between the two spinner events. Not done if negative.
     */
    public static setTimeGap(timeGapBetweenClicks: number): void {
        if (timeGapBetweenClicks > 0) {
            SpinnerChangedFSM.timeGap = timeGapBetweenClicks;
        }
    }

    public constructor(logger: Logger, dataHandler: SpinnerChangedHandler) {
        super(logger, dataHandler);

        const changed = this.addStdState("changed");
        const spinnerAction = (evt: Event): void => {
            this.dataHandler?.initToChangedHandler(evt);
        };

        new SpinnerChangedTransition(this.initState, changed, spinnerAction);
        new SpinnerChangedTransition(changed, changed, spinnerAction);
        new TimeoutTransition(changed, this.addTerminalState("ended"), SpinnerChangedFSM.timeGapSupplier);
    }
}

interface SpinnerChangedHandler extends FSMDataHandler {
    initToChangedHandler(event: Event): void;
}

/**
 * A user interaction for Number input.
 */
export class SpinnerChanged extends InteractionBase<WidgetData<HTMLInputElement>, WidgetDataImpl<HTMLInputElement>, SpinnerChangedFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(logger: Logger) {
        const handler: SpinnerChangedHandler = {
            "initToChangedHandler": (event: Event): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new SpinnerChangedFSM(logger, handler), new WidgetDataImpl<HTMLInputElement>(), logger);
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isSpinner(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isSpinner(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
