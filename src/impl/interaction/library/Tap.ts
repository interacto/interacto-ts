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

import {InteractionBase} from "../InteractionBase";
import {FSMImpl} from "../../fsm/FSMImpl";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import {StdState} from "../../fsm/StdState";
import {CancellingState} from "../../fsm/CancellingState";
import type {TapData} from "../../../api/interaction/TapData";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {TapDataImpl} from "../TapDataImpl";
import {TouchDataImpl} from "../TouchDataImpl";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";

/**
 * The FSM for the Tap interaction
 */
class TapFSM extends FSMImpl {
    private countTaps: number;

    private readonly nbTaps: number;

    private touchID?: number;

    /**
     * Creates the Tap FSM
     */
    public constructor(nbTaps: number) {
        super();
        this.nbTaps = nbTaps;
        this.countTaps = 0;
    }

    public override buildFSM(dataHandler?: TapFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);

        const down = new StdState(this, "down");
        const up = new StdState(this, "up");
        const ended = new TerminalState(this, "ended");
        const cancelled = new CancellingState(this, "cancelled");
        this.addState(down);
        this.addState(up);
        this.addState(ended);
        this.addState(cancelled);
        const pressureAction = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            this.countTaps++;
            dataHandler?.tap(event);
        };
        const press1 = new TouchPressureTransition(this.initState, down);
        press1.action = pressureAction;

        const move = new TouchMoveTransition(down, cancelled);
        move.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;

        // No multi-touch
        const noMulti = new TouchPressureTransition(down, cancelled);
        noMulti.isGuardOK = (event: TouchEvent): boolean => [...event.touches].filter(t => t.identifier === this.touchID).length > 0;

        // Required to clean touch events lost by the browser
        const cleanEvent = new TouchPressureTransition(down, down);
        // To detect the event is lost, checking it is not part of the touches any more
        cleanEvent.isGuardOK = (event: TouchEvent): boolean => [...event.touches].filter(t => t.identifier === this.touchID).length === 0;
        // Then replacing the current tap (but not increment)
        cleanEvent.action = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            dataHandler?.tap(event);
        };

        const release = new TouchReleaseTransition(down, ended);
        release.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID && this.nbTaps === this.countTaps;
        const release2 = new TouchReleaseTransition(down, up);
        release2.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID && this.nbTaps !== this.countTaps;
        const press2 = new TouchPressureTransition(up, down);
        press2.action = pressureAction;

        new TouchMoveTransition(up, cancelled);
        new TimeoutTransition(down, cancelled, () => 1000);
        new TimeoutTransition(up, cancelled, () => 1000);
    }

    public override reinit(): void {
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
export class Tap extends InteractionBase<TapData, TapDataImpl, TapFSM> {
    private readonly handler: TapFSMHandler;

    /**
     * Creates the tap interaction
     * @param numberTaps - The number of taps expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public constructor(numberTaps: number) {
        super(new TapFSM(numberTaps), new TapDataImpl());

        this.handler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches.length > 0) {
                    const touch = new TouchDataImpl();
                    touch.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0], evt, [...evt.touches]));
                    this._data.addTapData(touch);
                }
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }
}
