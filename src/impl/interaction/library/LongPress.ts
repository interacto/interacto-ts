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
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {InteractionBase} from "../InteractionBase";
import {PointData} from "../../../api/interaction/PointData";
import {PressureTransition} from "../../fsm/PressureTransition";
import {ReleaseTransition} from "../../fsm/ReleaseTransition";
import {PointDataImpl} from "./PointDataImpl";

/**
 * The FSM for the LongPress interaction
 */
export class LongPressFSM extends FSMImpl {
    private readonly duration: number;

    private currentButton: number | undefined;

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

    public buildFSM(dataHandler?: LongPressFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const down = new StdState(this, "down");
        const releasedTooEarly = new CancellingState(this, "releasedEarly");
        const timeouted = new TerminalState(this, "timeouted");

        this.addState(down);
        this.addState(releasedTooEarly);
        this.addState(timeouted);

        const press = new PressureTransition(this.initState, down);
        press.action = (event: MouseEvent): void => {
            this.currentButton = event.button;
            dataHandler?.press(event);
        };

        const release = new ReleaseTransition(down, releasedTooEarly);
        release.isGuardOK = (event: MouseEvent): boolean => event.button === this.currentButton;

        new TimeoutTransition(down, timeouted, () => this.duration);
    }

    public reinit(): void {
        super.reinit();
        this.currentButton = undefined;
    }
}

interface LongPressFSMHandler extends FSMDataHandler {
    press(evt: MouseEvent): void;
}

export class LongPress extends InteractionBase<PointData, LongPressFSM> {
    private readonly handler: LongPressFSMHandler;

    /**
     * Creates the long press interaction
     * @param duration - The duration of the pressure required to ends the user interaction (in ms)
     * If this duration is not reached, the interaction is cancelled.
     */
    public constructor(duration: number) {
        super(new LongPressFSM(duration));

        this.handler = {
            "press": (evt: MouseEvent): void => {
                (this.data as (PointDataImpl)).setPointData(
                    evt.clientX, evt.clientY, evt.screenX, evt.screenY, evt.button, evt.target ?? undefined,
                    evt.currentTarget ?? undefined);
            },
            "reinitData": (): void => this.reinitData()
        };

        this.getFsm().buildFSM(this.handler);
    }

    protected createDataObject(): PointData {
        return new PointDataImpl();
    }
}
