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
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {InteractionImpl} from "../InteractionImpl";
import {SrcTgtTouchData, SrcTgtTouchDataImpl} from "./SrcTgtTouchData";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {OutputState} from "../../fsm/OutputState";
import {InputState} from "../../fsm/InputState";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {CancellingState} from "../../fsm/CancellingState";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";

/**
 * The FSM for the Pan interaction
 */
export class PanFSM extends FSM {
    // eslint-disable-next-line @typescript-eslint/typedef,@typescript-eslint/naming-convention
    private static readonly PanMoveTransitionKO = class extends TouchMoveTransition {
        private readonly _parent: PanFSM;

        public constructor(parent: PanFSM, srcState: OutputState, tgtState: InputState) {
            super(srcState, tgtState);
            this._parent = parent;
        }

        public isGuardOK(evt: Event): boolean {
            return evt instanceof TouchEvent &&
                evt.changedTouches[0].identifier === this._parent.touchID &&
                !this._parent.isStable(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        }
    };

    // eslint-disable-next-line @typescript-eslint/typedef,@typescript-eslint/naming-convention
    private static readonly PanMoveTransitionOK = class extends TouchMoveTransition {
        private readonly parent: PanFSM;

        private readonly dataHandler?: PanFSMDataHandler;

        public constructor(parent: PanFSM, srcState: OutputState, tgtState: InputState,
                           dataHandler?: PanFSMDataHandler) {
            super(srcState, tgtState);
            this.parent = parent;
            this.dataHandler = dataHandler;
        }

        public action(event: Event): void {
            if (event instanceof TouchEvent && this.dataHandler !== undefined) {
                this.dataHandler.panning(event);
            }
        }

        public isGuardOK(evt: Event): boolean {
            return evt instanceof TouchEvent &&
                evt.changedTouches[0].identifier === this.parent.touchID &&
                this.parent.isStable(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        }
    };

    protected readonly horizontal: boolean;

    protected readonly minLength: number;

    protected readonly pxTolerance: number;

    protected touchID: number | undefined;

    protected stableAxe: number | undefined;

    protected moveAxe: number | undefined;

    /**
     * Creates the FSM.
     */
    public constructor(horizontal: boolean, minLength: number, pxTolerance: number) {
        super();
        this.touchID = undefined;
        this.stableAxe = undefined;
        this.moveAxe = undefined;
        this.horizontal = horizontal;
        this.minLength = minLength;
        this.pxTolerance = pxTolerance;
    }

    public getPanDistance(x: number, y: number): number {
        const moveAxe2 = this.horizontal ? x : y;
        return this.moveAxe === undefined ? 0 : Math.abs(this.moveAxe - moveAxe2);
    }

    public isStable(x: number, y: number): boolean {
        const stableAxe2 = this.horizontal ? y : x;
        return this.stableAxe === undefined ? false : Math.abs(this.stableAxe - stableAxe2) <= this.pxTolerance;
    }

    public buildFSM(dataHandler?: PanFSMDataHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const touched = new StdState(this, "touched");
        const moved = new StdState(this, "moved");
        const released = new TerminalState(this, "released");
        const cancelled = new CancellingState(this, "cancelled");

        this.addState(touched);
        this.addState(moved);
        this.addState(released);
        this.addState(cancelled);

        this._startingState = moved;

        new class extends TouchPressureTransition {
            private readonly _parent: PanFSM;

            public constructor(parent: PanFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof TouchEvent) {
                    this._parent.setInitialValueOnTouch(event);
                    if (dataHandler !== undefined) {
                        dataHandler.touch(event);
                    }
                }
            }
        }(this, this.initState, touched);

        new class extends TouchReleaseTransition {
            private readonly _parent: PanFSM;

            public constructor(parent: PanFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof TouchEvent && event.changedTouches[0].identifier === this._parent.touchID;
            }
        }(this, touched, cancelled);

        new PanFSM.PanMoveTransitionKO(this, touched, cancelled);

        new PanFSM.PanMoveTransitionKO(this, moved, cancelled);

        new PanFSM.PanMoveTransitionOK(this, touched, moved, dataHandler);

        new PanFSM.PanMoveTransitionOK(this, moved, moved, dataHandler);

        new class extends TouchReleaseTransition {
            private readonly _parent: PanFSM;

            public constructor(parent: PanFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(evt: Event): boolean {
                return evt instanceof TouchEvent &&
                    evt.changedTouches[0].identifier === this._parent.touchID &&
                    !this._parent.checkFinalPanConditions(evt);
            }
        }(this, moved, cancelled);

        new class extends TouchReleaseTransition {
            private readonly _parent: PanFSM;

            public constructor(parent: PanFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(evt: Event): boolean {
                return evt instanceof TouchEvent &&
                    evt.changedTouches[0].identifier === this._parent.touchID &&
                    this._parent.checkFinalPanConditions(evt);
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof TouchEvent) {
                    dataHandler.panned(event);
                }
            }
        }(this, moved, released);

        super.buildFSM(dataHandler);
    }

    protected setInitialValueOnTouch(evt: TouchEvent): void {
        const touch: Touch = evt.changedTouches[0];
        this.touchID = touch.identifier;
        this.moveAxe = this.horizontal ? touch.clientX : touch.clientY;
        this.stableAxe = this.horizontal ? touch.clientY : touch.clientX;
    }

    protected checkFinalPanConditions(evt: TouchEvent): boolean {
        return this.getPanDistance(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY) >= this.minLength;
    }

    public reinit(): void {
        super.reinit();
        this.touchID = undefined;
        this.stableAxe = undefined;
        this.moveAxe = undefined;
    }
}

interface PanFSMDataHandler extends FSMDataHandler {
    touch(evt: TouchEvent): void;
    panning(evt: TouchEvent): void;
    panned(evt: TouchEvent): void;
}

/**
 * A Pan user interaction.
 */
export class Pan extends InteractionImpl<SrcTgtTouchData, PanFSM> {
    private readonly handler: PanFSMDataHandler;


    /**
     * Creates the interaction.
     * @param horizontal Defines whether the pan is horizontal or vertical
     * @param minLength The minimal distance from the starting point to the release point for validating the pan
     * @param pxTolerance The tolerance rate in pixels accepted while executing the pan
     */
    public constructor(horizontal: boolean, minLength: number, pxTolerance: number, fsm?: PanFSM) {
        super(fsm ?? new PanFSM(horizontal, minLength, pxTolerance));

        this.handler = new class implements PanFSMDataHandler {
            private readonly _parent: Pan;

            public constructor(parent: Pan) {
                this._parent = parent;
            }

            public touch(evt: TouchEvent): void {
                const touch: Touch = evt.changedTouches[0];
                const data = (this._parent.data as (SrcTgtTouchDataImpl));
                data.setPointData(touch.clientX, touch.clientY, touch.screenX, touch.screenY,
                    undefined, touch.target, touch.target);
                data.setTouchId(touch.identifier);
                data.setTgtData(touch.clientX, touch.clientY, touch.screenX, touch.screenY, touch.target);
            }

            public panning(evt: TouchEvent): void {
                const touch: Touch = evt.changedTouches[0];
                (this._parent.data as (SrcTgtTouchDataImpl)).setTgtData(touch.clientX, touch.clientY, touch.screenX,
                    touch.screenY, touch.target);
            }

            public panned(evt: TouchEvent): void {
                const touch: Touch = evt.changedTouches[0];
                (this._parent.data as (SrcTgtTouchDataImpl)).setTgtData(touch.clientX, touch.clientY, touch.screenX,
                    touch.screenY, touch.target);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): SrcTgtTouchData {
        return new SrcTgtTouchDataImpl();
    }
}
