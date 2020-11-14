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

import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {Click, ClickFSM} from "./Click";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {StdState} from "../../fsm/StdState";
import {SubFSMTransition} from "../../fsm/SubFSMTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {MoveTransition} from "../../fsm/MoveTransition";
import {PointData} from "../../../api/interaction/PointData";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "./PointDataImpl";

export class DoubleClickFSM extends FSMImpl {
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

    public constructor() {
        super();
        this.firstClickFSM = new ClickFSM();
        this.sndClickFSM = new ClickFSM();
    }


    public log(log: boolean): void {
        super.log(log);
        this.firstClickFSM.log(log);
        this.sndClickFSM.log(log);
    }

    public buildFSM(dataHandler?: FSMDataHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        this.firstClickFSM.buildFSM();
        this.sndClickFSM.buildFSM();
        const dbleclicked = new TerminalState(this, "dbleclicked");
        const cancelled = new CancellingState(this, "cancelled");
        const clicked = new StdState(this, "clicked");

        this.addState(clicked);
        this.addState(dbleclicked);
        this.addState(cancelled);
        this.setStartingState(dbleclicked);

        const firstClick = new SubFSMTransition(this.initState, clicked, this.firstClickFSM);
        firstClick.action = (): void => this.setCheckButton(this.firstClickFSM.getCheckButton());

        const move = new MoveTransition(clicked, cancelled);
        move.isGuardOK = (event: Event): boolean => (this.checkButton === undefined || event instanceof MouseEvent &&
                    event.button === this.checkButton);

        new TimeoutTransition(clicked, cancelled, DoubleClickFSM.timeGapSupplier);
        new SubFSMTransition(clicked, dbleclicked, this.sndClickFSM);
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


    public fullReinit(): void {
        super.fullReinit();
        this.firstClickFSM.fullReinit();
        this.sndClickFSM.fullReinit();
    }

    public reinit(): void {
        super.reinit();
        this.firstClickFSM.reinit();
        this.sndClickFSM.reinit();
        this.checkButton = undefined;
    }
}

export class DoubleClick extends InteractionBase<PointData, DoubleClickFSM> {
    public readonly firstClick: Click;

    public constructor(fsm?: DoubleClickFSM) {
        super(fsm ?? new DoubleClickFSM());

        this.firstClick = new Click(this.getFsm().firstClickFSM);
        this.getFsm().buildFSM(this);
    }

    public reinitData(): void {
        super.reinitData();
        this.firstClick.reinitData();
    }

    public getData(): PointData {
        return this.firstClick.getData();
    }

    public createDataObject(): PointData {
        return new PointDataImpl();
    }
}
