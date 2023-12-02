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
import {TapDataImpl} from "../TapDataImpl";
import {TouchDataImpl} from "../TouchDataImpl";
import type {PointsData} from "../../../api/interaction/PointsData";
import type {TouchData} from "../../../api/interaction/TouchData";
import type {Logger} from "../../../api/logging/Logger";
import type {CancellingState} from "../../fsm/CancellingState";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {StdState} from "../../fsm/StdState";
import type {PointsDataImpl} from "../PointsDataImpl";

interface TapFSMHandler extends FSMDataHandler {
    tap(evt: TouchEvent): void;
}

/**
 * The FSM for the Tap interaction
 */
export class TapFSM extends FSMImpl<TapFSMHandler> {
    private countTaps: number;

    private readonly nbTaps: number;

    private touchID?: number;

    protected readonly downState: StdState;

    protected readonly cancelState: CancellingState;

    /**
     * Creates the Tap FSM
     * @param nbTaps - The number of taps to support
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(nbTaps: number, logger: Logger, dataHandler: TapFSMHandler) {
        super(logger, dataHandler);
        this.nbTaps = nbTaps;
        this.countTaps = 0;

        this.downState = this.addStdState("down");
        const up = this.addStdState("up");
        this.cancelState = this.addCancellingState("cancelled");
        const action = (event: TouchEvent): void => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.touchID = event.changedTouches[0]!.identifier;
            this.countTaps++;
            this.dataHandler?.tap(event);
        };

        new TouchTransition(this.initState, this.downState, "touchstart", action);
        new TouchTransition(up, this.downState, "touchstart", action);

        new TouchTransition(this.downState, this.cancelState, "touchmove", undefined,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (evt: TouchEvent): boolean => evt.changedTouches[0]!.identifier === this.touchID);

        // No multi-touch
        new TouchTransition(this.downState, this.cancelState, "touchstart", undefined,
            (evt: TouchEvent): boolean => Array.from(evt.touches).some(t => t.identifier === this.touchID));

        // Required to clean touch events lost by the browser
        new TouchTransition(this.downState, this.downState, "touchstart",
            // Replacing the current tap (but not increment)
            (event: TouchEvent): void => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.touchID = event.changedTouches[0]!.identifier;
                this.dataHandler?.tap(event);
            },
            // To detect the event is lost, checking it is not part of the touches any more
            (evt: TouchEvent): boolean => Array.from(evt.touches).filter(t => t.identifier === this.touchID).length === 0);

        new TouchTransition(this.downState, this.addTerminalState("ended"), "touchend", undefined,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (evt: TouchEvent): boolean => evt.changedTouches[0]!.identifier === this.touchID && this.nbTaps === this.countTaps);

        new TouchTransition(this.downState, up, "touchend", undefined,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (evt: TouchEvent): boolean => evt.changedTouches[0]!.identifier === this.touchID && this.nbTaps !== this.countTaps);

        new TouchTransition(up, this.cancelState, "touchmove");
        new TimeoutTransition(up, this.cancelState, () => 1000);
    }

    public override reinit(): void {
        super.reinit();
        this.countTaps = 0;
    }
}

/**
 * A tap user interaction.
 * This touch interaction takes as input the number of taps expected to end the interaction.
 * If this number is not reached after a timeout, the interaction is cancelled.
 */
export class Tap extends InteractionBase<PointsData<TouchData>, PointsDataImpl<TouchData>, TapFSM> {
    /**
     * Creates the tap interaction
     * @param numberTaps - The number of taps expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(numberTaps: number, logger: Logger, name?: string) {
        const handler: TapFSMHandler = {
            "tap": (evt: TouchEvent): void => {
                if (evt.changedTouches.length > 0) {
                    const touch = new TouchDataImpl();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    touch.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0]!, evt, Array.from(evt.touches)));
                    this._data.addPoint(touch);
                }
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new TapFSM(numberTaps, logger, handler), new TapDataImpl(), logger, name ?? Tap.name);
    }
}
