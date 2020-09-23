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

import {FSM} from "../../fsm/FSM";
import {InteractionImpl} from "../InteractionImpl";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchData";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TouchData, TouchDataImpl} from "./TouchData";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";

/**
 * The FSM for the LongTouch interaction
 */
class LongTouchFSM extends FSM {
    private readonly duration: number;

    private currentTouchID: number | undefined;

    /**
     * Creates the long touch FSM
     * @param duration Defines the duration of the touch interaction.
     */
    public constructor(duration: number) {
        super();

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        this.duration = duration;
        this.currentTouchID = undefined;
    }

    public buildFSM(dataHandler?: LongTouchFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        const touched = new StdState(this, "touched");
        const releasedTooEarly = new CancellingState(this, "releasedEarly");
        const timeouted = new TerminalState(this, "timeouted");

        this.addState(touched);
        this.addState(releasedTooEarly);
        this.addState(timeouted);

        const press = new TouchPressureTransition(this.initState, touched);
        press.action = (event: Event): void => {
            if (event instanceof TouchEvent) {
                this.currentTouchID = event.changedTouches[0].identifier;
                if (dataHandler !== undefined) {
                    dataHandler.tap(event);
                }
            }
        };

        const release = new TouchReleaseTransition(touched, releasedTooEarly);
        release.isGuardOK = (event: Event): boolean => event instanceof TouchEvent &&
            event.changedTouches[0].identifier === this.currentTouchID;

        new TimeoutTransition(touched, timeouted, () => this.duration);

        super.buildFSM(dataHandler);
    }

    public reinit(): void {
        super.reinit();
        this.currentTouchID = undefined;
    }
}

interface LongTouchFSMHandler extends FSMDataHandler {
    tap(evt: TouchEvent): void;
}

export class LongTouch extends InteractionImpl<TouchData, LongTouchFSM> {
    private readonly handler: LongTouchFSMHandler;

    /**
     * Creates the long tap interaction
     * @param duration The duration of the touch required to ends the user interaction
     * If this duration is not reached, the interaction is cancelled.
     */
    public constructor(duration: number) {
        super(new LongTouchFSM(duration));

        this.handler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches.length > 0) {
                    const touch = evt.changedTouches[0];
                    (this.data as (SrcTgtTouchDataImpl)).setPointData(
                        touch.clientX, touch.clientY, touch.screenX, touch.screenY, undefined,
                        touch.target, touch.target);
                    (this.data as (SrcTgtTouchDataImpl)).setTouchId(touch.identifier);
                }
            },
            "reinitData": (): void => this.reinitData()
        };

        this.getFsm().buildFSM(this.handler);
    }

    protected createDataObject(): TouchData {
        return new TouchDataImpl();
    }
}
