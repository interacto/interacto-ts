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
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import type {TouchData} from "../../../api/interaction/TouchData";
import {TouchDataImpl} from "../TouchDataImpl";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";

/**
 * The FSM for the LongTouch interaction
 */
class LongTouchFSM extends FSMImpl<LongTouchFSMHandler> {
    private readonly duration: number;

    private currentTouchID?: number;

    /**
     * Creates the long touch FSM
     * @param duration - Defines the duration of the touch interaction.
     */
    public constructor(duration: number, dataHandler: LongTouchFSMHandler) {
        super(dataHandler);

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        this.duration = duration;
        this.currentTouchID = undefined;

        const touched = new StdState(this, "touched");
        const cancelled = new CancellingState(this, "cancelled");
        const timeouted = new TerminalState(this, "timeouted");

        this.addState(touched);
        this.addState(cancelled);
        this.addState(timeouted);

        const press = new TouchPressureTransition(this.initState, touched);
        press.action = (event: TouchEvent): void => {
            this.currentTouchID = event.changedTouches[0].identifier;
            this.dataHandler?.tap(event);
        };

        const moved = new TouchMoveTransition(touched, cancelled);
        moved.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.currentTouchID;


        const release = new TouchReleaseTransition(touched, cancelled);
        release.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.currentTouchID;

        new TimeoutTransition(touched, timeouted, () => this.duration);
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
    public constructor(duration: number) {
        const handler: LongTouchFSMHandler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches.length > 0) {
                    this._data.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0], evt, [...evt.touches]));
                }
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new LongTouchFSM(duration, handler), new TouchDataImpl());
    }
}
