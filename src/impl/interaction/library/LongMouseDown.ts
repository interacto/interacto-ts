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

/**
 * The FSM for the LongPress interaction
 * @category FSM
 */
export class LongMouseDownFSM extends FSMImpl {
    private readonly duration: number;

    private currentButton: number | undefined;

    /**
     * Creates the long press FSM
     * @param duration - Defines the duration of the long press interaction (in ms).
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on long mouse down
     */
    public constructor(duration: number, logger: Logger, action: (evt: MouseEvent) => void) {
        super(logger);

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        this.duration = duration;
        this.currentButton = undefined;

        const down = this.addStdState("down");
        const cancelled = this.addCancellingState("cancelled");
        const timeouted = this.addTerminalState("timeouted");

        new MouseTransition(this.initState, down, "mousedown",
            (evt: MouseEvent): void => {
                this.currentButton = evt.button;
                action(evt);
            });

        const move = new MouseTransition(down, cancelled, "mousemove", undefined,
            (evt: MouseEvent): boolean => evt.button === this.currentButton);

        new MouseTransition(down, cancelled, "mouseup", undefined, move.guard);

        new TimeoutTransition(down, timeouted, () => this.duration);
    }

    public override reinit(): void {
        super.reinit();
        this.currentButton = undefined;
    }
}

/**
 * The long mouse down interaction. The interaction ends after a delay after having a mouse down (with no mouse up)
 * @category Interaction Library
 */
export class LongMouseDown extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the long press interaction
     * @param duration - The duration of the pressure required to end the user interaction (in ms)
     * If this duration is not reached, the interaction is cancelled.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(duration: number, logger: Logger, name?: string) {
        const action = (evt: MouseEvent): void => {
            this._data.copy(evt);
        };
        super(new LongMouseDownFSM(duration, logger, action), new PointDataImpl(), logger, name ?? LongMouseDown.name);
    }
}
