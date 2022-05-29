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
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {getTouch} from "../../fsm/Events";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../../api/interaction/TouchData";

/**
 * The FSM that defines a touch interaction (that works like a DnD)
 */
export class TouchDnDFSM extends FSMImpl<TouchDnDFSMHandler> {
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
    public constructor(cancellable: boolean, dataHandler: TouchDnDFSMHandler, movementRequired: boolean = true) {
        super(dataHandler);
        this.touchID = undefined;
        this.cancellable = cancellable;
        this.movementRequired = movementRequired;
        this.buildFSM();
    }

    // eslint-disable-next-line max-lines-per-function
    private buildFSM(): void {
        new TerminalState(this, "released");

        const touched = this.addStdState("touched");
        const moved = this.addStdState("moved");
        const released = this.addTerminalState("released");
        const cancelled = this.addCancellingState("cancelled");

        const touchDown = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            this.dataHandler?.onTouch(event);
        };

        const fixTouchDownCheck = (event: TouchEvent): boolean => [...event.touches].filter(t => t.identifier === this.touchID).length === 0;

        new TouchPressureTransition(this.initState, touched, touchDown);

        // If the touch up event is lost by the browser and another touch down occurs
        // we must restart the interaction
        new TouchPressureTransition(touched, touched, touchDown, fixTouchDownCheck);

        if (this.movementRequired) {
            this.startingState = moved;
            new TouchReleaseTransition(touched, cancelled, undefined,
                (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID);
        } else {
            new TouchReleaseTransition(touched, released,
                (event: TouchEvent): void => {
                    this.dataHandler?.onRelease(event);
                },
                (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID);
        }

        new TouchMoveTransition(touched, moved,
            (event: TouchEvent): void => {
                this.dataHandler?.onMove(event);
            },
            (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID);

        new TouchMoveTransition(moved, moved,
            (event: TouchEvent): void => {
                this.dataHandler?.onMove(event);
            },
            (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID);

        // If the touch up event is lost by the browser and another touch down occurs
        // we must restart the interaction
        new TouchPressureTransition(moved, touched, touchDown, fixTouchDownCheck);

        // Transitions used if the DnD can be cancelled by releasing the touch on a dwell spring element
        if (this.cancellable) {
            new TouchReleaseTransition(moved, released,
                (event: TouchEvent): void => {
                    this.dataHandler?.onRelease(event);
                },
                (event: TouchEvent): boolean => {
                // Touch event behaviour is not consistent with mouse events: event.tgt.target points to the original element, not to the one
                // currently targeted. So we have to retrieve the current target manually.
                    const tgt = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    return event.changedTouches[0].identifier === this.touchID &&
                    (!(tgt instanceof Element) || !tgt.classList.contains("ioDwellSpring"));
                });

            new TouchReleaseTransition(moved, cancelled, undefined,
                (ev: TouchEvent): boolean => {
                    const tgt = document.elementFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
                    return ev.changedTouches[0].identifier === this.touchID && tgt instanceof Element && tgt.classList.contains("ioDwellSpring");
                });
        } else {
            new TouchReleaseTransition(moved, released,
                (event: TouchEvent): void => {
                    this.dataHandler?.onRelease(event);
                },
                (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID);
        }
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
    /**
     * Creates the interaction.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param movementRequired - Whether the DnD starts after the touch point has begun moving (default)
     * or as soon as the screen is touched.
     * The latter is used for the MultiTouch interaction.
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(cancellable: boolean, movementRequired: boolean = true, fsm?: TouchDnDFSM) {
        const handler: TouchDnDFSMHandler = {
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

        super(fsm ?? new TouchDnDFSM(cancellable, handler, movementRequired), new SrcTgtTouchDataImpl());
    }

    private setTgtData(evt: TouchEvent): void {
        const touch: Touch | undefined = getTouch(evt.changedTouches, this.data.src.identifier);
        if (touch !== undefined) {
            this._data.copyTgt(touch, evt, [...evt.touches]);
        }
    }
}
