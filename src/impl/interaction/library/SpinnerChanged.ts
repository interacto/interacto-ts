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
import {FSMImpl} from "../../fsm/FSMImpl";
import {SpinnerChangedTransition} from "../../fsm/SpinnerChangedTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM of the spinner interaction
 * @category FSM
 */
export class SpinnerChangedFSM extends FSMImpl {
    /** The time gap between the two spinner events. */
    private static timeGap = 300;

    /**
     * The supplier that provides the time gap.
     * @returns The time gap
     */
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

    public constructor(logger: Logger, action: (evt: Event) => void) {
        super(logger);

        const changed = this.addStdState("changed");

        new SpinnerChangedTransition(this.initState, changed, action);
        new SpinnerChangedTransition(changed, changed, action);
        new TimeoutTransition(changed, this.addTerminalState("ended"), SpinnerChangedFSM.timeGapSupplier);
    }
}

/**
 * A user interaction for Number input.
 * @category Interaction Library
 */
export class SpinnerChanged extends InteractionBase<WidgetData<HTMLInputElement>, WidgetDataImpl<HTMLInputElement>> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (event: Event): void => {
            this._data.copy(event);
        };
        super(new SpinnerChangedFSM(logger, action), new WidgetDataImpl<HTMLInputElement>(), logger, name ?? SpinnerChanged.name);
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
