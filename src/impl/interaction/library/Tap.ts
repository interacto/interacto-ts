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
import type {TapData} from "../../../api/interaction/TapData";
import {TapDataImpl} from "../TapDataImpl";
import {TouchDataImpl} from "../TouchDataImpl";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import type {Logger} from "../../../api/logging/Logger";
import {TouchTransition} from "../../fsm/TouchTransition";

/**
 * The FSM for the Tap interaction
 */
class TapFSM extends FSMImpl<TapFSMHandler> {
    private countTaps: number;

    private readonly nbTaps: number;

    private touchID?: number;

    /**
     * Creates the Tap FSM
     */
    public constructor(nbTaps: number, logger: Logger, dataHandler: TapFSMHandler) {
        super(logger, dataHandler);
        this.nbTaps = nbTaps;
        this.countTaps = 0;

        const down = this.addStdState("down");
        const up = this.addStdState("up");
        const cancelled = this.addCancellingState("cancelled");
        const action = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            this.countTaps++;
            this.dataHandler?.tap(event);
        };

        new TouchTransition(this.initState, down, "touchstart", action);
        new TouchTransition(up, down, "touchstart", action);

        new TouchTransition(down, cancelled, "touchmove", undefined,
            (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID);

        // No multi-touch
        new TouchTransition(down, cancelled, "touchstart", undefined,
            (evt: TouchEvent): boolean => Array.from(evt.touches).some(t => t.identifier === this.touchID));

        // Required to clean touch events lost by the browser
        new TouchTransition(down, down, "touchstart",
            // Replacing the current tap (but not increment)
            (event: TouchEvent): void => {
                this.touchID = event.changedTouches[0].identifier;
                this.dataHandler?.tap(event);
            },
            // To detect the event is lost, checking it is not part of the touches any more
            (evt: TouchEvent): boolean => Array.from(evt.touches).filter(t => t.identifier === this.touchID).length === 0);

        new TouchTransition(down, this.addTerminalState("ended"), "touchend", undefined,
            (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID && this.nbTaps === this.countTaps);

        new TouchTransition(down, up, "touchend", undefined,
            (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID && this.nbTaps !== this.countTaps);

        new TouchTransition(up, cancelled, "touchmove");
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
    /**
     * Creates the tap interaction
     * @param numberTaps - The number of taps expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public constructor(numberTaps: number, logger: Logger) {
        const handler: TapFSMHandler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches.length > 0) {
                    const touch = new TouchDataImpl();
                    touch.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0], evt, Array.from(evt.touches)));
                    this._data.addTapData(touch);
                }
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new TapFSM(numberTaps, logger, handler), new TapDataImpl(), logger);
    }
}
