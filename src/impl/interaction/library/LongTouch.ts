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
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {TouchTransition} from "../../fsm/TouchTransition";
import {InteractionBase} from "../InteractionBase";
import {TouchDataImpl} from "../TouchDataImpl";
import type {TouchData} from "../../../api/interaction/TouchData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM for the LongTouch interaction
 */
class LongTouchFSM extends FSMImpl {
    private readonly duration: number;

    private currentTouchID: number | undefined;

    /**
     * Creates the long touch FSM
     * @param duration - Defines the duration of the touch interaction.
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a long touch
     */
    public constructor(duration: number, logger: Logger, action: (event: TouchEvent) => void) {
        super(logger);

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        this.duration = duration;
        this.currentTouchID = undefined;

        const touched = this.addStdState("touched");
        const cancelled = this.addCancellingState("cancelled");

        new TouchTransition(this.initState, touched, "touchstart",
            (event: TouchEvent): void => {
                if (event.changedTouches[0] !== undefined) {
                    this.currentTouchID = event.changedTouches[0].identifier;
                    action(event);
                }
            });

        new TouchTransition(touched, cancelled, "touchmove", undefined,
            (ev: TouchEvent): boolean => ev.changedTouches[0] !== undefined && ev.changedTouches[0].identifier === this.currentTouchID);

        new TouchTransition(touched, cancelled, "touchend", undefined,
            (ev: TouchEvent): boolean => ev.changedTouches[0] !== undefined && ev.changedTouches[0].identifier === this.currentTouchID);

        new TimeoutTransition(touched, this.addTerminalState("timeouted"), () => this.duration);
    }

    public override reinit(): void {
        super.reinit();
        this.currentTouchID = undefined;
    }
}

/**
 * The long touch interaction.
 * @category Interaction Library
 */
export class LongTouch extends InteractionBase<TouchData, TouchDataImpl> {
    /**
     * Creates the long tap interaction
     * @param duration - The duration of the touch required to ends the user interaction
     * If this duration is not reached, the interaction is cancelled.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(duration: number, logger: Logger, name?: string) {
        const action = (evt: TouchEvent): void => {
            if (evt.changedTouches[0] !== undefined) {
                this._data.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0], evt, Array.from(evt.touches)));
            }
        };

        super(new LongTouchFSM(duration, logger, action), new TouchDataImpl(), logger, name ?? LongTouch.name);
    }
}
