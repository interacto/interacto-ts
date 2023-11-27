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
import {InteractionBase} from "../InteractionBase";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import type {TouchData} from "../../../api/interaction/TouchData";
import {TouchDataImpl} from "../TouchDataImpl";
import type {Logger} from "../../../api/logging/Logger";
import {TouchTransition} from "../../fsm/TouchTransition";

/**
 * The FSM for the LongTouch interaction
 */
class LongTouchFSM extends FSMImpl<LongTouchFSMHandler> {
    private readonly duration: number;

    private currentTouchID: number | undefined;

    /**
     * Creates the long touch FSM
     * @param duration - Defines the duration of the touch interaction.
     */
    public constructor(duration: number, logger: Logger, dataHandler: LongTouchFSMHandler) {
        super(logger, dataHandler);

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
                    this.dataHandler?.tap(event);
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

interface LongTouchFSMHandler extends FSMDataHandler {
    tap(evt: TouchEvent): void;
}

export class LongTouch extends InteractionBase<TouchData, TouchDataImpl, LongTouchFSM> {
    /**
     * Creates the long tap interaction
     * @param duration - The duration of the touch required to ends the user interaction
     * If this duration is not reached, the interaction is cancelled.
     */
    public constructor(duration: number, logger: Logger, name?: string) {
        const handler: LongTouchFSMHandler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches[0] !== undefined) {
                    this._data.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0], evt, Array.from(evt.touches)));
                }
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new LongTouchFSM(duration, logger, handler), new TouchDataImpl(), logger, name ?? LongTouch.name);
    }
}
