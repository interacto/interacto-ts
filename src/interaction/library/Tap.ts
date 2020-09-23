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

import {InteractionImpl} from "../InteractionImpl";
import {FSM} from "../../fsm/FSM";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {StdState} from "../../fsm/StdState";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {CancellingState} from "../../fsm/CancellingState";
import {TapData, TapDataImpl} from "./TapData";
import {TouchDataImpl} from "./TouchData";

/**
 * The FSM for the Tap interaction
 */
class TapFSM extends FSM {
    private countTaps: number;

    private readonly nbTaps: number;

    /**
     * Creates the Tap FSM
     */
    public constructor(nbTaps: number) {
        super();
        this.nbTaps = nbTaps;
        this.countTaps = 0;
    }

    public buildFSM(dataHandler?: TapFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const touched = new StdState(this, "touched");
        const ended = new TerminalState(this, "ended");
        const timeouted = new CancellingState(this, "timeouted");
        this.addState(touched);
        this.addState(ended);
        this.addState(timeouted);

        const pressInit = new TouchPressureTransition(this.initState, ended);
        const pressInitAction = (event: Event): void => {
            if (event instanceof TouchEvent && dataHandler !== undefined) {
                dataHandler.tap(event);
            }
        };
        pressInit.action = pressInitAction;
        pressInit.isGuardOK = (_event: Event): boolean => this.nbTaps === 1;

        const pressTouched = new TouchPressureTransition(this.initState, touched);
        pressTouched.action = (event: Event): void => {
            if (event instanceof TouchEvent) {
                this.countTaps++;

                if (dataHandler !== undefined) {
                    dataHandler.tap(event);
                }
            }
        };
        pressTouched.isGuardOK = (_event: Event): boolean => this.nbTaps > 1;

        const pressTouchedTouched = new TouchPressureTransition(touched, touched);
        pressTouchedTouched.action = (event: Event): void => {
            this.countTaps++;
            if (event instanceof TouchEvent && dataHandler !== undefined) {
                dataHandler.tap(event);
            }
        };
        pressTouchedTouched.isGuardOK = (_event: Event): boolean => (this.countTaps + 1) < this.nbTaps;

        const pressEnded = new TouchPressureTransition(touched, ended);
        pressEnded.action = pressInitAction;
        pressEnded.isGuardOK = (_event: Event): boolean => (this.countTaps + 1) === this.nbTaps;

        new TimeoutTransition(touched, timeouted, () => 1000);
    }

    public reinit(): void {
        super.reinit();
        this.countTaps = 0;
    }
}

interface TapFSMHandler extends FSMDataHandler {
    tap(evt: TouchEvent): void;
}

/**
 * A tap user interaction.
 * This touch interaction takes as input the number of taps expected to end the interaction.
 * If this number is not reached after a timeout, the interaction is cancelled.
 */
export class Tap extends InteractionImpl<TapData, TapFSM> {
    private readonly handler: TapFSMHandler;

    /**
     * Creates the tap interaction
     * @param numberTaps The number of taps expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public constructor(numberTaps: number) {
        super(new TapFSM(numberTaps));

        this.handler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches.length > 0) {
                    const touch = evt.changedTouches[0];
                    (this.data as (TapDataImpl)).addTapData(
                        new TouchDataImpl(touch.identifier, touch.clientX, touch.clientY,
                            touch.screenX, touch.screenY, touch.target));
                }
            },
            "reinitData": (): void => this.reinitData()
        };

        this.getFsm().buildFSM(this.handler);
    }

    protected createDataObject(): TapData {
        return new TapDataImpl();
    }
}
