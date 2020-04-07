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
import {OutputState} from "../../fsm/OutputState";
import {InputState} from "../../fsm/InputState";
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

        new class extends TouchPressureTransition {
            private readonly _parent: TapFSM;

            public constructor(parent: TapFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof TouchEvent && dataHandler !== undefined) {
                    dataHandler.tap(event);
                }
            }

            public isGuardOK(_event: Event): boolean {
                return this._parent.nbTaps === 1;
            }
        }(this, this.initState, ended);

        new class extends TouchPressureTransition {
            private readonly _parent: TapFSM;

            public constructor(parent: TapFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof TouchEvent) {
                    this._parent.countTaps++;

                    if (dataHandler !== undefined) {
                        dataHandler.tap(event);
                    }
                }
            }

            public isGuardOK(_event: Event): boolean {
                return this._parent.nbTaps > 1;
            }
        }(this, this.initState, touched);

        new class extends TouchPressureTransition {
            private readonly _parent: TapFSM;

            public constructor(parent: TapFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                this._parent.countTaps++;
                if (event instanceof TouchEvent && dataHandler !== undefined) {
                    dataHandler.tap(event);
                }
            }

            public isGuardOK(_event: Event): boolean {
                return (this._parent.countTaps + 1) < this._parent.nbTaps;
            }
        }(this, touched, touched);

        new class extends TouchPressureTransition {
            private readonly _parent: TapFSM;

            public constructor(parent: TapFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof TouchEvent && dataHandler !== undefined) {
                    dataHandler.tap(event);
                }
            }

            public isGuardOK(_event: Event): boolean {
                return (this._parent.countTaps + 1) === this._parent.nbTaps;
            }
        }(this, touched, ended);

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

        this.handler = new class implements TapFSMHandler {
            private readonly _parent: Tap;

            public constructor(parent: Tap) {
                this._parent = parent;
            }

            public tap(evt: TouchEvent): void {
                const touch = evt.changedTouches[0];
                if(touch !== undefined) {
                    (this._parent.data as (TapDataImpl)).addTapData(
                        new TouchDataImpl(touch.identifier, touch.clientX, touch.clientY,
                            touch.screenX, touch.screenY, touch.target));
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);

        this.getFsm().buildFSM(this.handler);
    }

    protected createDataObject(): TapData {
        return new TapDataImpl();
    }
}
