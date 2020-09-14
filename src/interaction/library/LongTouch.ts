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
import {OutputState} from "../../fsm/OutputState";
import {InputState} from "../../fsm/InputState";
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

        new class extends TouchPressureTransition {
            private readonly _parent: LongTouchFSM;

            public constructor(parent: LongTouchFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof TouchEvent) {
                    this._parent.currentTouchID = event.changedTouches[0].identifier;
                    if (dataHandler !== undefined) {
                        dataHandler.tap(event);
                    }
                }
            }
        }(this, this.initState, touched);

        new class extends TouchReleaseTransition {
            private readonly _parent: LongTouchFSM;

            public constructor(parent: LongTouchFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return super.isGuardOK(event) &&
                    event instanceof TouchEvent &&
                    event.changedTouches[0].identifier === this._parent.currentTouchID;
            }
        }(this, touched, releasedTooEarly);

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

        this.handler = new class implements LongTouchFSMHandler {
            private readonly _parent: LongTouch;

            public constructor(parent: LongTouch) {
                this._parent = parent;
            }

            public tap(evt: TouchEvent): void {
                if (evt.changedTouches.length > 0) {
                    const touch = evt.changedTouches[0];
                    (this._parent.data as (SrcTgtTouchDataImpl)).setPointData(
                        touch.clientX, touch.clientY, touch.screenX, touch.screenY, undefined,
                        touch.target, touch.target);
                    (this._parent.data as (SrcTgtTouchDataImpl)).setTouchId(touch.identifier);
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);

        this.getFsm().buildFSM(this.handler);
    }

    protected createDataObject(): TouchData {
        return new TouchDataImpl();
    }
}
