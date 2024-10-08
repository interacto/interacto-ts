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

import {TapsFSM} from "./Taps";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {InteractionBase} from "../InteractionBase";
import {TapsDataImpl} from "../TapsDataImpl";
import {TouchDataImpl} from "../TouchDataImpl";
import type {PointsData} from "../../../api/interaction/PointsData";
import type {TouchData} from "../../../api/interaction/TouchData";
import type {Logger} from "../../../api/logging/Logger";

class TimedTapsFSM extends TapsFSM {
    public constructor(duration: number, nbTaps: number, logger: Logger, dataHandler: (event: TouchEvent) => void) {
        super(nbTaps, logger, dataHandler);

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        new TimeoutTransition(this.downState, this.cancelState, () => duration);
    }
}

/**
 * A tap user interaction that has a timeout:
 * while touching, if the timeout is reached the interaction is cancelled.
 * This touch interaction takes as input the timeout (in ms) the number of taps expected to end the interaction.
 * If this number is not reached after a timeout, the interaction is cancelled.
 * @category Interaction Library
 */
export class TimedTaps extends InteractionBase<PointsData<TouchData>, TapsDataImpl> {
    /**
     * Creates the timed tap interaction
     * @param duration - The max duration before a timeout while touching.
     * @param numberTaps - The number of taps expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(duration: number, numberTaps: number, logger: Logger, name?: string) {
        const action = (evt: TouchEvent): void => {
            if (evt.changedTouches.length > 0) {
                const touch = new TouchDataImpl();
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                touch.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0]!, evt, Array.from(evt.touches)));
                this._data.addPoint(touch);
            }
        };

        super(new TimedTapsFSM(duration, numberTaps, logger, action), new TapsDataImpl(), logger, name ?? TimedTaps.name);
    }
}
