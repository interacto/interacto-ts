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
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {CancellingState} from "../../fsm/CancellingState";

/**
 * The FSM that defines a touch interaction used as part of a Pan interaction.
 * A Pan is composed of one or more Pan Touches, depending on how many are required by the binder.
 */
export class PanTouchFSM extends FSMImpl {
    private touchID?: number;

    private readonly isHorizontal: boolean;

    private readonly minLength: number;

    /**
     * Creates the FSM.
     */
    public constructor(horizontal: boolean, minLength: number) {
        super();
        this.touchID = undefined;
        this.isHorizontal = horizontal;
        this.minLength = minLength;
    }

    /**
     * Checks if the Pan this PanTouch is part of is horizontal enough (or vertical enough) for the interaction to continue.
     */
    private hasCorrectOrientation(dataHandler?: PanTouchFSMHandler): boolean {
        return this.isHorizontal ? dataHandler?.isHorizontal() === true : dataHandler?.isVertical() === true;
    }

    /**
     * Checks if the Pan this PanTouch is part of is long enough to be ended successfully.
     */
    private hasCorrectLength(dataHandler?: PanTouchFSMHandler): boolean {
        if (dataHandler !== undefined) {
            return this.isHorizontal
                ? (Math.abs(dataHandler.getDiffX(this.touchID)) >= this.minLength) : (Math.abs(dataHandler.getDiffY(this.touchID)) >= this.minLength);
        }
        return false;
    }

    // eslint-disable-next-line max-lines-per-function
    public override buildFSM(dataHandler?: PanTouchFSMHandler): void {
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

        // The interaction doesn't start as long as the contact point hasn't started moving.
        this.startingState = moved;

        this.createTransitions(touched, moved, released, cancelled, dataHandler);

        super.buildFSM(dataHandler);
    }

    /**
     * Creates the transitions for the FSM.
     */
    private createTransitions(touched: StdState, moved: StdState, released: TerminalState, cancelled: CancellingState,
                              dataHandler?: PanTouchFSMHandler): void {
        // The condition that checks if the interaction can continue after any new movement.
        const moveCondition = (event: TouchEvent): boolean => (event.changedTouches[0].identifier === this.touchID) &&
            this.hasCorrectOrientation(dataHandler);

        const pressure = new TouchPressureTransition(this.initState, touched);
        pressure.action = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            dataHandler?.onTouch(event);
        };

        const initialMoveOK = new TouchMoveTransition(touched, moved);
        initialMoveOK.isGuardOK = (event: TouchEvent): boolean => {
            // Interaction data has to be updated before testing the transition condition, since the condition relies on the data.
            dataHandler?.onMove(event);
            return moveCondition(event);
        };

        const initialMoveKO = new TouchMoveTransition(touched, cancelled);
        initialMoveKO.isGuardOK = (event: TouchEvent): boolean => {
            dataHandler?.onMove(event);
            return !moveCondition(event);
        };

        const moveOK = new TouchMoveTransition(moved, moved);
        moveOK.isGuardOK = (event: TouchEvent): boolean => {
            dataHandler?.onMove(event);
            return moveCondition(event);
        };

        const moveKO = new TouchMoveTransition(moved, cancelled);
        moveKO.isGuardOK = (event: TouchEvent): boolean => {
            dataHandler?.onMove(event);
            return !moveCondition(event);
        };

        const releaseOK = new TouchReleaseTransition(moved, released);
        releaseOK.isGuardOK = (event: TouchEvent): boolean => {
            dataHandler?.onRelease(event);
            return moveCondition(event) && this.hasCorrectLength(dataHandler);
        };

        const releaseKO = new TouchReleaseTransition(moved, cancelled);
        releaseKO.isGuardOK = (event: TouchEvent): boolean => {
            dataHandler?.onRelease(event);
            return !(moveCondition(event) && this.hasCorrectLength(dataHandler));
        };
    }

    public getTouchId(): number | undefined {
        return this.touchID;
    }

    public override reinit(): void {
        super.reinit();
        this.touchID = undefined;
    }
}

export interface PanTouchFSMHandler extends FSMDataHandler {
    onTouch(event: TouchEvent): void;

    onMove(event: TouchEvent): void;

    onRelease(event: TouchEvent): void;

    isHorizontal(): boolean;

    isVertical(): boolean;

    getDiffX(id: number | undefined): number;

    getDiffY(id: number | undefined): number;
}
