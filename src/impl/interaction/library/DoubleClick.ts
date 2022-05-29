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

import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {Click, ClickFSM} from "./Click";
import {FSMImpl} from "../../fsm/FSMImpl";
import type {PointData} from "../../../api/interaction/PointData";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import {MouseMoveTransition} from "../../fsm/MouseMoveTransition";
import {SubFSMTransition} from "../../fsm/SubFSMTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";

export class DoubleClickFSM extends FSMImpl<FSMDataHandler> {
    /** The time gap between the two spinner events. */
    private static timeGap = 300;

    /** The supplier that provides the time gap. */
    private static readonly timeGapSupplier: () => number = () => DoubleClickFSM.getTimeGap();

    /**
     * @returns The time gap between the two spinner events.
     */
    public static getTimeGap(): number {
        return DoubleClickFSM.timeGap;
    }

    /**
     * Sets The time gap between the two spinner events.
     * @param timeGapBetweenClicks - The time gap between the two spinner events. Not done if negative.
     */
    public static setTimeGap(timeGapBetweenClicks: number): void {
        if (timeGapBetweenClicks > 0) {
            DoubleClickFSM.timeGap = timeGapBetweenClicks;
        }
    }

    public readonly firstClickFSM: ClickFSM;

    private readonly sndClickFSM: ClickFSM;

    private checkButton?: number;

    public constructor(dataHandler?: FSMDataHandler) {
        super(dataHandler);
        this.firstClickFSM = new ClickFSM();
        this.sndClickFSM = new ClickFSM();

        const errorHandler = {
            "fsmError": (err: unknown): void => {
                this.notifyHandlerOnError(err);
            }
        };

        this.firstClickFSM.addHandler(errorHandler);
        this.sndClickFSM.addHandler(errorHandler);

        const cancelled = this.addCancellingState("cancelled");
        const clicked = this.addStdState("clicked");

        new SubFSMTransition(this.initState, clicked, this.firstClickFSM,
            (): void => {
                this.setCheckButton(this.firstClickFSM.getCheckButton());
            });

        new MouseMoveTransition(clicked, cancelled, undefined,
            (ev: Event): boolean => (this.checkButton === undefined || ev instanceof MouseEvent && ev.button === this.checkButton));

        new TimeoutTransition(clicked, cancelled, DoubleClickFSM.timeGapSupplier);
        new SubFSMTransition(clicked, this.addTerminalState("dbleclicked", true), this.sndClickFSM);
    }


    // eslint-disable-next-line accessor-pairs
    public override set log(log: boolean) {
        super.log = log;
        this.firstClickFSM.log = log;
        this.sndClickFSM.log = log;
    }

    public setCheckButton(buttonToCheck: number): void {
        if (this.checkButton === undefined) {
            this.checkButton = buttonToCheck;
        }
        this.sndClickFSM.setCheckButton(buttonToCheck);
    }

    public getCheckButton(): number {
        return this.checkButton ?? -1;
    }


    public override fullReinit(): void {
        super.fullReinit();
        this.firstClickFSM.fullReinit();
        this.sndClickFSM.fullReinit();
    }

    public override reinit(): void {
        super.reinit();
        this.firstClickFSM.reinit();
        this.sndClickFSM.reinit();
        this.checkButton = undefined;
    }
}

export class DoubleClick extends InteractionBase<PointData, PointDataImpl, DoubleClickFSM> {
    public constructor(fsm?: DoubleClickFSM, data?: PointDataImpl) {
        super(fsm ?? new DoubleClickFSM(), data ?? new PointDataImpl());

        this.fsm.dataHandler = {
            "reinitData": (): void => {
                this.reinitData();
            }
        };
        // We give the interaction to the first click as this click interaction
        // will contains the data: so that this interaction will fill the data
        // of the double-click.
        new Click(this.fsm.firstClickFSM, this._data);
    }
}
