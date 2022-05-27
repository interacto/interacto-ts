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
import {StdState} from "../../fsm/StdState";
import {CancellingState} from "../../fsm/CancellingState";
import {TerminalState} from "../../fsm/TerminalState";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {InteractionBase} from "../InteractionBase";
import type {PointData} from "../../../api/interaction/PointData";
import {MouseDownTransition} from "../../fsm/MouseDownTransition";
import {MouseUpTransition} from "../../fsm/MouseUpTransition";
import {PointDataImpl} from "../PointDataImpl";
import {MouseMoveTransition} from "../../fsm/MouseMoveTransition";

/**
 * The FSM for the LongPress interaction
 */
export class LongMouseDownFSM extends FSMImpl {
    private readonly duration: number;

    private currentButton?: number;

    /**
     * Creates the long press FSM
     * @param duration - Defines the duration of the long press interaction (in ms).
     */
    public constructor(duration: number) {
        super();

        if (duration <= 0) {
            throw new Error("Incorrect duration");
        }

        this.duration = duration;
        this.currentButton = undefined;
    }

    public override buildFSM(dataHandler?: LongMouseDownFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const down = new StdState(this, "down");
        const cancelled = new CancellingState(this, "cancelled");
        const timeouted = new TerminalState(this, "timeouted");

        this.addState(down);
        this.addState(cancelled);
        this.addState(timeouted);

        const press = new MouseDownTransition(this.initState, down);
        press.action = (event: MouseEvent): void => {
            this.currentButton = event.button;
            dataHandler?.press(event);
        };

        const guard = (event: MouseEvent): boolean => event.button === this.currentButton;
        const moved = new MouseMoveTransition(down, cancelled);
        moved.isGuardOK = guard;

        const release = new MouseUpTransition(down, cancelled);
        release.isGuardOK = guard;

        new TimeoutTransition(down, timeouted, () => this.duration);
    }

    public override reinit(): void {
        super.reinit();
        this.currentButton = undefined;
    }
}

interface LongMouseDownFSMHandler extends FSMDataHandler {
    press(evt: MouseEvent): void;
}

export class LongMouseDown extends InteractionBase<PointData, PointDataImpl, LongMouseDownFSM> {
    /**
     * Creates the long press interaction
     * @param duration - The duration of the pressure required to end the user interaction (in ms)
     * If this duration is not reached, the interaction is cancelled.
     */
    public constructor(duration: number) {
        const handler: LongMouseDownFSMHandler = {
            "press": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new LongMouseDownFSM(duration), new PointDataImpl());

        this.fsm.buildFSM(handler);
    }
}
