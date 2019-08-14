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
import {InputState} from "../../fsm/InputState";
import {FSM} from "../../fsm/FSM";
import {OutputState} from "../../fsm/OutputState";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {MoveTransition} from "../../fsm/MoveTransition";
import {PointData} from "./PointData";
import { InteractionImpl } from "../InteractionImpl";

export class DoubleClickFSM extends FSM {
    /** The time gap between the two spinner events. */
    private static timeGap = 300;
    /** The supplier that provides the time gap. */
    private static readonly SUPPLY_TIME_GAP = () => DoubleClickFSM.getTimeGap();

    /**
     * @return The time gap between the two spinner events.
     */
    public static getTimeGap(): number {
        return DoubleClickFSM.timeGap;
    }

    /**
     * Sets The time gap between the two spinner events.
     * @param timeGapBetweenClicks The time gap between the two spinner events. Not done if negative.
     */
    public static setTimeGap(timeGapBetweenClicks: number): void {
        if (timeGapBetweenClicks > 0) {
            DoubleClickFSM.timeGap = timeGapBetweenClicks;
        }
    }

    public readonly firstClickFSM: ClickFSM;
    private readonly sndClick: ClickFSM;
    private checkButton: number | undefined;

    public constructor() {
        super();
        this.firstClickFSM = new ClickFSM();
        this.sndClick = new ClickFSM();
    }

    public buildFSM(dataHandler?: FSMDataHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        this.firstClickFSM.buildFSM();
        this.sndClick.buildFSM();
        const dbleclicked = new TerminalState(this, "dbleclicked");
        const cancelled = new CancellingState(this, "cancelled");
        const clicked = new StdState(this, "clicked");

        this.addState(clicked);
        this.addState(dbleclicked);
        this.addState(cancelled);
        this.startingState = dbleclicked;

        new class extends SubFSMTransition {
            private readonly _parent: DoubleClickFSM;

            public constructor(parent: DoubleClickFSM, srcState: OutputState, tgtState: InputState, fsm: FSM) {
                super(srcState, tgtState, fsm);
                this._parent = parent;
            }

            protected action(event: Event): void {
                this._parent.setCheckButton(this._parent.firstClickFSM.getCheckButton());
            }
        }(this, this.initState, clicked, this.firstClickFSM);

        new class extends MoveTransition {
            private readonly _parent: DoubleClickFSM;

            public constructor(parent: DoubleClickFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return super.isGuardOK(event) && (this._parent.checkButton === undefined || event instanceof MouseEvent &&
                    event.button === this._parent.checkButton);
            }
        }(this, clicked, cancelled);

        new TimeoutTransition(clicked, cancelled, DoubleClickFSM.SUPPLY_TIME_GAP);
        new SubFSMTransition(clicked, dbleclicked, this.sndClick);
    }

    public setCheckButton(buttonToCheck: number): void {
        if (this.checkButton === undefined) {
            this.checkButton = buttonToCheck;
        }
        this.sndClick.setCheckButton(buttonToCheck);
    }

    public getCheckButton(): number {
        return this.checkButton === undefined ? -1 : this.checkButton;
    }

    public reinit(): void {
        super.reinit();
        this.checkButton = undefined;
    }
}

export class DoubleClick extends InteractionImpl<PointData, DoubleClickFSM, Node> {
    public readonly firstClick: Click;

    public constructor(fsm?: DoubleClickFSM) {
        super(fsm === undefined ? new DoubleClickFSM() : fsm);

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
}
