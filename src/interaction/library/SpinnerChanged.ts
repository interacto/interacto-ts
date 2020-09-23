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
import {isSpinner} from "../../fsm/Events";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {WidgetData, WidgetDataImpl} from "./WidgetData";
import {SpinnerChangedTransition} from "../../fsm/SpinnerChangedTransition";
import {FSM} from "../../fsm/FSM";
import {InteractionImpl} from "../InteractionImpl";
import {StdState} from "../../fsm/StdState";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";

export class SpinnerChangedFSM extends FSM {
    /** The time gap between the two spinner events. */
    private static timeGap = 300;

    /** The supplier that provides the time gap. */
    private static readonly timeGapSupplier: () => number = () => SpinnerChangedFSM.getTimeGap();

    /**
     * @return The time gap between the two spinner events.
     */
    public static getTimeGap(): number {
        return SpinnerChangedFSM.timeGap;
    }

    /**
     * Sets The time gap between the two spinner events.
     * @param timeGapBetweenClicks The time gap between the two spinner events. Not done if negative.
     */
    public static setTimeGap(timeGapBetweenClicks: number): void {
        if (timeGapBetweenClicks > 0) {
            SpinnerChangedFSM.timeGap = timeGapBetweenClicks;
        }
    }

    public buildFSM(dataHandler?: SpinnerChangedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const changed = new StdState(this, "valueChanged");
        const ended = new TerminalState(this, "ended");

        this.addState(changed);
        this.addState(ended);

        const spinnerAction: (_: Event) => void = (event: Event) => {
            if (event.target !== null && isSpinner(event.target) && dataHandler !== undefined) {
                dataHandler.initToChangedHandler(event);
            }
        };

        const changedInit = new SpinnerChangedTransition(this.initState, changed);
        changedInit.action = spinnerAction;

        const changedChanged = new SpinnerChangedTransition(changed, changed);
        changedChanged.action = spinnerAction;

        new TimeoutTransition(changed, ended, SpinnerChangedFSM.timeGapSupplier);
    }
}

interface SpinnerChangedHandler extends FSMDataHandler {
    initToChangedHandler(event: Event): void;
}

/**
 * A user interaction for Number input.
 * @author Gwendal DIDOT
 */
export class SpinnerChanged extends InteractionImpl<WidgetData<HTMLInputElement>, SpinnerChangedFSM> {
    private readonly handler: SpinnerChangedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new SpinnerChangedFSM());

        this.handler = {
            "initToChangedHandler": (event: Event): void => {
                if (event.target !== null && isSpinner(event.target)) {
                    (this.data as WidgetDataImpl<HTMLInputElement>).setWidget(event.target);
                }
            },
            "reinitData": (): void => this.reinitData()
        };

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isSpinner(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isSpinner(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }

    public createDataObject(): WidgetData<HTMLInputElement> {
        return new WidgetDataImpl<HTMLInputElement>();
    }
}
