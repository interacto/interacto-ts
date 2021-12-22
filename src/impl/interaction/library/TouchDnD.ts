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

import {InteractionBase} from "../InteractionBase";
import {FSMImpl} from "../../fsm/FSMImpl";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {getTouch} from "../../fsm/Events";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../../api/interaction/TouchData";
import {CancellingState} from "../../fsm/CancellingState";

/**
 * The FSM that defines a touch interaction (that works like a DnD)
 */
export class TouchDnDFSM extends FSMImpl {
    private touchID?: number;

    private readonly cancellable;

    private readonly movementRequired;

    /**
     * Creates the FSM.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param movementRequired - Whether the DnD starts after the touch point has begun moving (default)
     * or as soon as the screen is touched.
     * The latter is used for the MultiTouch interaction.
     */
    public constructor(cancellable: boolean, movementRequired: boolean = true) {
        super();
        this.touchID = undefined;
        this.cancellable = cancellable;
        this.movementRequired = movementRequired;
    }

    // eslint-disable-next-line max-lines-per-function
    public override buildFSM(dataHandler?: TouchDnDFSMHandler): void {
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

        const touchDownFn = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            dataHandler?.onTouch(event);
        };

        const fixTouchDownCheck = (event: TouchEvent): boolean => [...event.touches].filter(t => t.identifier === this.touchID).length === 0;

        const pressure = new TouchPressureTransition(this.initState, touched);
        pressure.action = touchDownFn;

        // If the touch up event is lost by the browser and another touch down occurs
        // we must restart the interaction
        const fixBlockedEvent = new TouchPressureTransition(touched, touched);
        fixBlockedEvent.isGuardOK = fixTouchDownCheck;
        fixBlockedEvent.action = touchDownFn;

        if (this.movementRequired) {
            this.startingState = moved;
            const tap = new TouchReleaseTransition(touched, cancelled);
            tap.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
        } else {
            const releaseTouched = new TouchReleaseTransition(touched, released);
            releaseTouched.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
            releaseTouched.action = (event: TouchEvent): void => {
                dataHandler?.onRelease(event);
            };
        }

        const firstMove = new TouchMoveTransition(touched, moved);
        firstMove.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
        firstMove.action = (event: TouchEvent): void => {
            dataHandler?.onMove(event);
        };

        const move = new TouchMoveTransition(moved, moved);
        move.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
        move.action = (event: TouchEvent): void => {
            dataHandler?.onMove(event);
        };

        // If the touch up event is lost by the browser and another touch down occurs
        // we must restart the interaction
        const fixBlockedEvent2 = new TouchPressureTransition(moved, touched);
        fixBlockedEvent2.isGuardOK = fixTouchDownCheck;
        fixBlockedEvent2.action = touchDownFn;

        // Transitions used if the DnD can be cancelled by releasing the touch on a dwell spring element
        if (this.cancellable) {
            const release = new TouchReleaseTransition(moved, released);
            release.isGuardOK = (event: TouchEvent): boolean => {
                // Touch event behaviour is not consistent with mouse events: event.tgt.target points to the original element, not to the one
                // currently targeted. So we have to retrieve the current target manually.
                const tgt = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                return event.changedTouches[0].identifier === this.touchID &&
                    (!(tgt instanceof Element) || !tgt.classList.contains("ioDwellSpring"));
            };
            release.action = (event: TouchEvent): void => {
                dataHandler?.onRelease(event);
            };

            const releaseCancel = new TouchReleaseTransition(moved, cancelled);
            releaseCancel.isGuardOK = (event: TouchEvent): boolean => {
                const tgt = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                return event.changedTouches[0].identifier === this.touchID && tgt instanceof Element && tgt.classList.contains("ioDwellSpring");
            };
        } else {
            const release = new TouchReleaseTransition(moved, released);
            release.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
            release.action = (event: TouchEvent): void => {
                dataHandler?.onRelease(event);
            };
        }
        super.buildFSM(dataHandler);
    }

    public getTouchId(): number | undefined {
        return this.touchID;
    }

    public override reinit(): void {
        super.reinit();
        this.touchID = undefined;
    }
}

export interface TouchDnDFSMHandler extends FSMDataHandler {
    onTouch(event: TouchEvent): void;

    onMove(event: TouchEvent): void;

    onRelease(event: TouchEvent): void;
}

/**
 * A touch interaction (that works as a DnD)
 */
export class TouchDnD extends InteractionBase<SrcTgtPointsData<TouchData>, SrcTgtTouchDataImpl, TouchDnDFSM> {
    private readonly handler: TouchDnDFSMHandler;

    /**
     * Creates the interaction.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param movementRequired - Whether the DnD starts after the touch point has begun moving (default)
     * or as soon as the screen is touched.
     * The latter is used for the MultiTouch interaction.
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(cancellable: boolean, movementRequired: boolean = true, fsm?: TouchDnDFSM) {
        super(fsm ?? new TouchDnDFSM(cancellable, movementRequired), new SrcTgtTouchDataImpl());

        this.handler = {
            "onTouch": (evt: TouchEvent): void => {
                const touch: Touch = evt.changedTouches[0];
                const all = [...evt.touches];
                this._data.copySrc(touch, evt, all);
                this._data.copyTgt(touch, evt, all);
            },
            "onMove": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "onRelease": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }

    private setTgtData(evt: TouchEvent): void {
        const touch: Touch | undefined = getTouch(evt.changedTouches, this.data.src.identifier);
        if (touch !== undefined) {
            this._data.copyTgt(touch, evt, [...evt.touches]);
        }
    }
}
