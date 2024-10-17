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

import {getTouch} from "../../fsm/Events";
import {FSMImpl} from "../../fsm/FSMImpl";
import {TouchTransition} from "../../fsm/TouchTransition";
import {InteractionBase} from "../InteractionBase";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../../api/interaction/TouchData";
import type {Logger} from "../../../api/logging/Logger";
import type {CancellingState} from "../../fsm/CancellingState";
import type {StdState} from "../../fsm/StdState";

/**
 * The data handler for the touch DnD interaction
 * @category Helper
 */
export interface TouchDnDFSMHandler {
    /**
     * On a touch
     * @param event - The event to process.
     */
    onTouch(event: TouchEvent): void;

    /**
     * On a move
     * @param event - The event to process.
     */
    onMove(event: TouchEvent): void;

    /**
     * On a release
     * @param event - The event to process.
     */
    onRelease(event: TouchEvent): void;
}

/**
 * The FSM that defines a touch interaction (that works like a DnD)
 * @category FSM
 */
export class TouchDnDFSM extends FSMImpl {
    protected touchID: number | undefined;

    protected readonly cancellable;

    protected readonly movementRequired;

    protected readonly cancelled: CancellingState;

    protected readonly moved: StdState;

    protected readonly touched: StdState;

    /**
     * Creates the FSM.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     * @param movementRequired - Whether the DnD starts after the touch point has begun moving (default)
     * or as soon as the screen is touched. The latter is used for the MultiTouch interaction.
     */
    public constructor(cancellable: boolean, logger: Logger, dataHandler: TouchDnDFSMHandler, movementRequired = true) {
        super(logger);
        this.touchID = undefined;
        this.cancellable = cancellable;
        this.movementRequired = movementRequired;
        this.cancelled = this.addCancellingState("cancelled");
        this.moved = this.addStdState("moved");
        this.touched = this.addStdState("touched");
        this.buildFSM(dataHandler);
    }

    // eslint-disable-next-line max-lines-per-function
    protected buildFSM(dataHandler: TouchDnDFSMHandler): void {
        const released = this.addTerminalState("released");

        const touchDown = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0]?.identifier;
            dataHandler.onTouch(event);
        };

        const fixTouchDownCheck = (event: TouchEvent): boolean =>
            !Array.from(event.touches).some(touch => touch.identifier === this.touchID);

        new TouchTransition(this.initState, this.touched, "touchstart", touchDown);

        /*
         * If the touch up event is lost by the browser and another touch down occurs
         * we must restart the interaction
         */
        new TouchTransition(this.touched, this.touched, "touchstart", touchDown, fixTouchDownCheck);

        if (this.movementRequired) {
            this.startingState = this.moved;
            new TouchTransition(this.touched, this.cancelled, "touchend", undefined,
                (event: TouchEvent): boolean => event.changedTouches[0] !== undefined && event.changedTouches[0].identifier === this.touchID);
        } else {
            new TouchTransition(this.touched, released, "touchend",
                (event: TouchEvent): void => {
                    dataHandler.onRelease(event);
                },
                (event: TouchEvent): boolean => event.changedTouches[0] !== undefined && event.changedTouches[0].identifier === this.touchID);
        }

        const moved = (event: TouchEvent): void => {
            dataHandler.onMove(event);
        };
        const movedPredicate = (event: TouchEvent): boolean => event.changedTouches[0]?.identifier === this.touchID;

        new TouchTransition(this.touched, this.moved, "touchmove", moved, movedPredicate);
        new TouchTransition(this.moved, this.moved, "touchmove", moved, movedPredicate);

        /*
         * If the touch up event is lost by the browser and another touch down occurs
         * we must restart the interaction
         */
        new TouchTransition(this.moved, this.touched, "touchstart", touchDown, fixTouchDownCheck);

        // Transitions used if the DnD can be cancelled by releasing the touch on a dwell spring element
        if (this.cancellable) {
            new TouchTransition(this.moved, released, "touchend",
                (event: TouchEvent): void => {
                    dataHandler.onRelease(event);
                },
                (event: TouchEvent): boolean => {
                /*
                 * Touch event behaviour is not consistent with mouse events: event.tgt.target points to the original element, not to the one
                 * currently targeted. So we have to retrieve the current target manually.
                 */
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const touch = event.changedTouches[0]!;
                    const tgt = document.elementFromPoint(touch.clientX, touch.clientY);
                    return touch.identifier === this.touchID &&
                      (!(tgt instanceof Element) || !tgt.classList.contains("ioDwellSpring"));
                });

            new TouchTransition(this.moved, this.cancelled, "touchend", undefined,
                (ev: TouchEvent): boolean => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const touch = ev.changedTouches[0]!;
                    const tgt = document.elementFromPoint(touch.clientX, touch.clientY);
                    return touch.identifier === this.touchID && tgt instanceof Element && tgt.classList.contains("ioDwellSpring");
                });
        } else {
            new TouchTransition(this.moved, released, "touchend",
                (event: TouchEvent): void => {
                    dataHandler.onRelease(event);
                },
                (event: TouchEvent): boolean => event.changedTouches[0]?.identifier === this.touchID);
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

/**
 * The FSM of the one touch DnD interaction
 * @category FSM
 */
export class OneTouchDnDFSM extends TouchDnDFSM {
    /**
     * Creates a DnD touch FSM that only works with one touch.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(cancellable: boolean, logger: Logger, dataHandler: TouchDnDFSMHandler) {
        super(cancellable, logger, dataHandler, true);
    }

    protected override buildFSM(dataHandler: TouchDnDFSMHandler): void {
        super.buildFSM(dataHandler);

        const check = (event: TouchEvent): boolean => event.changedTouches[0] !== undefined && event.changedTouches[0].identifier !== this.touchID;

        new TouchTransition(this.moved, this.cancelled, "touchstart", undefined, check);
        new TouchTransition(this.touched, this.cancelled, "touchstart", undefined, check);
    }
}

/**
 * A touch interaction (that works as a DnD)
 * @category Interaction Library
 */
export class TouchDnD extends InteractionBase<SrcTgtPointsData<TouchData>, SrcTgtTouchDataImpl> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param fsm - The optional FSM provided for the interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, cancellable: boolean, fsm?: OneTouchDnDFSM, name?: string) {
        const handler: TouchDnDFSMHandler = {
            "onTouch": (evt: TouchEvent): void => {
                if (evt.changedTouches[0] !== undefined) {
                    const touch: Touch = evt.changedTouches[0];
                    const all = Array.from(evt.touches);
                    this._data.copySrc(touch, evt, all);
                    this._data.copyTgt(touch, evt, all);
                }
            },
            "onMove": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "onRelease": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            }
        };

        super(fsm ?? new OneTouchDnDFSM(cancellable, logger, handler), new SrcTgtTouchDataImpl(), logger, name ?? TouchDnD.name);
    }

    private setTgtData(evt: TouchEvent): void {
        const touch: Touch | undefined = getTouch(evt.changedTouches, this.data.src.identifier);
        if (touch !== undefined) {
            this._data.copyTgt(touch, evt, Array.from(evt.touches));
        }
    }
}
