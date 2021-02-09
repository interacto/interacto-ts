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
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {InteractionBase} from "../InteractionBase";
import {SrcTgtTouchData} from "../../../api/interaction/SrcTgtTouchData";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {CancellingState} from "../../fsm/CancellingState";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";

/**
 * The FSM for the Pan interaction
 */
export class PanFSM extends FSMImpl {
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

        const press = new TouchPressureTransition(this.initState, touched);
        press.action = (event: TouchEvent): void => {
            this.setInitialValueOnTouch(event);
            dataHandler?.touch(event);
        };

        const releaseTouched = new TouchReleaseTransition(touched, cancelled);
        releaseTouched.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;

        this.configMove(touched, cancelled, moved, dataHandler);
        this.configRelease(moved, cancelled, released, dataHandler);
    }


    private configMove(touched: StdState, cancelled: CancellingState, moved: StdState, dataHandler?: PanFSMDataHandler): void {
        const isGuardMoveKO = (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID &&
            !this.isStable(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);

        const moveTouched = new TouchMoveTransition(touched, cancelled);
        moveTouched.isGuardOK = isGuardMoveKO;

        const moveCancelled = new TouchMoveTransition(moved, cancelled);
        moveCancelled.isGuardOK = isGuardMoveKO;

        const isGuardMoveOK = (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID &&
            this.isStable(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        const actionMoveOK = (event: TouchEvent): void => {
            dataHandler?.panning(event);
        };

        const moveTouchedOK = new TouchMoveTransition(touched, moved);
        moveTouchedOK.isGuardOK = isGuardMoveOK;
        moveTouchedOK.action = actionMoveOK;

        const moveMovedOK = new TouchMoveTransition(moved, moved);
        moveMovedOK.isGuardOK = isGuardMoveOK;
        moveMovedOK.action = actionMoveOK;
    }


    private configRelease(moved: StdState, cancelled: CancellingState, released: TerminalState, dataHandler?: PanFSMDataHandler): void {
        const releaseMoved = new TouchReleaseTransition(moved, cancelled);
        releaseMoved.isGuardOK = (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID &&
            !this.checkFinalPanConditions(evt);

        const releaseFinal = new TouchReleaseTransition(moved, released);
        releaseFinal.isGuardOK = (evt: TouchEvent): boolean => evt.changedTouches[0].identifier === this.touchID &&
            this.checkFinalPanConditions(evt);
        releaseFinal.action = (event: TouchEvent): void => {
            dataHandler?.panned(event);
        };
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
export class Pan extends InteractionBase<SrcTgtTouchData, PanFSM> {
    private readonly handler: PanFSMDataHandler;


    /**
     * Creates the interaction.
     * @param horizontal - Defines whether the pan is horizontal or vertical
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public constructor(horizontal: boolean, minLength: number, pxTolerance: number, fsm?: PanFSM) {
        super(fsm ?? new PanFSM(horizontal, minLength, pxTolerance));

        this.handler = {
            "touch": (evt: TouchEvent): void => {
                const touch: Touch = evt.changedTouches[0];
                const data = (this.data as (SrcTgtTouchDataImpl));
                data.setPointData(touch.clientX, touch.clientY, touch.screenX, touch.screenY,
                    undefined, touch.target, touch.target);
                data.setTouchId(touch.identifier);
                data.setTgtData(touch.clientX, touch.clientY, touch.screenX, touch.screenY, touch.target);
            },
            "panning": (evt: TouchEvent): void => {
                const touch: Touch = evt.changedTouches[0];
                (this.data as (SrcTgtTouchDataImpl)).setTgtData(touch.clientX, touch.clientY, touch.screenX,
                    touch.screenY, touch.target);
            },
            "panned": (evt: TouchEvent): void => {
                const touch: Touch = evt.changedTouches[0];
                (this.data as (SrcTgtTouchDataImpl)).setTgtData(touch.clientX, touch.clientY, touch.screenX,
                    touch.screenY, touch.target);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): SrcTgtTouchData {
        return new SrcTgtTouchDataImpl();
    }
}
