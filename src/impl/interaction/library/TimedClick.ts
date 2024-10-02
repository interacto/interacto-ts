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

import {FSMImpl} from "../../fsm/FSMImpl";
import {MouseTransition} from "../../fsm/MouseTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

interface ClickFSMHandler extends FSMDataHandler {
    initToClicked(event: MouseEvent): void;
}

/**
 * The FSM of the timed click interaction
 * @category FSM
 */
export class TimedClickFSM extends FSMImpl<ClickFSMHandler> {
    private currentButton: number | undefined;

    private readonly buttonToConsider: number | undefined;

    /**
     * Creates the FSM
     * @param duration - The max duration of the click
     * @param logger - The logger to use for this interaction
     * @param button - The button to be used
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(duration: number, logger: Logger, button?: number, dataHandler?: ClickFSMHandler) {
        super(logger, dataHandler);

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        this.buttonToConsider = button;

        const pressed = this.addStdState("pressed");
        const cancelled = this.addCancellingState("cancelled");

        new MouseTransition(this.initState, pressed, "mousedown",
            (evt: MouseEvent): void => {
                this.setButtonToCheck(evt.button);
                this.dataHandler?.initToClicked(evt);
            },
            (evt: MouseEvent): boolean => this.buttonToConsider === undefined || evt.button === this.buttonToConsider);

        new MouseTransition(pressed, this.addTerminalState("clicked", true), "mouseup",
            (evt: MouseEvent): void => {
                this.dataHandler?.initToClicked(evt);
            },
            (evt: MouseEvent): boolean => this.currentButton === undefined || evt.button === this.currentButton);

        new MouseTransition(pressed, cancelled, "mousemove");
        new TimeoutTransition(pressed, cancelled, () => duration);
    }

    private setButtonToCheck(evtButton: number): void {
        this.currentButton = this.buttonToConsider ?? evtButton;
    }

    public override reinit(): void {
        super.reinit();
        this.currentButton = undefined;
    }
}

/**
 * A click interaction that is cancelled if the mouse up is not done before a given delay
 * @category Interaction Library
 */
export class TimedClick extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the interaction.
     * @param duration - The duration of the touch required to ends the user interaction
     * If this duration is not reached, the interaction is cancelled.
     * @param logger - The logger to use for this interaction
     * @param button - The mouse button to use
     * @param fsm - The optional FSM provided for the interaction
     * @param data - The interaction data to use
     * @param name - The name of the user interaction
     */
    public constructor(duration: number, logger: Logger, button?: number, fsm?: TimedClickFSM, data?: PointDataImpl, name?: string) {
        const theFSM = fsm ?? new TimedClickFSM(duration, logger, button);
        super(theFSM, data ?? new PointDataImpl(), logger, name ?? TimedClick.name);
        theFSM.dataHandler = {
            "initToClicked": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };
    }
}
