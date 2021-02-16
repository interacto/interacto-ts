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
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {ClickTransition} from "../../fsm/ClickTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "./PointDataImpl";
import {PointsData} from "../../../api/interaction/PointsData";
import {PointsDataImpl} from "./PointsDataImpl";

export class ClicksFSM extends FSMImpl {
    private countClicks: number;

    private readonly nbClicks: number;

    /**
     * Creates the Clicks FSM
     */
    public constructor(nbClicks: number) {
        super();

        if (nbClicks <= 0) {
            throw new Error("The number of clicks must be greater than 1");
        }

        if (nbClicks === 1) {
            throw new Error("For a number of clicks that equals 1, use the Click interaction");
        }

        this.countClicks = 0;
        this.nbClicks = nbClicks;
    }


    public reinit(): void {
        super.reinit();
        this.countClicks = 0;
    }

    public buildFSM(dataHandler?: ClicksFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const clicked = new StdState(this, "clicked");
        const ended = new TerminalState(this, "ended");
        const timeouted = new CancellingState(this, "timeouted");
        this.addState(clicked);
        this.addState(ended);
        this.addState(timeouted);

        const firstclick = new ClickTransition(this.initState, clicked);
        firstclick.action = (event: MouseEvent): void => {
            this.countClicks++;
            dataHandler?.click(event);
        };

        const newclick = new ClickTransition(clicked, clicked);
        newclick.action = (event: MouseEvent): void => {
            this.countClicks++;
            dataHandler?.click(event);
        };
        newclick.isGuardOK = (_event: MouseEvent): boolean => (this.countClicks + 1) < this.nbClicks;

        const finalclick = new ClickTransition(clicked, ended);
        finalclick.action = (event: MouseEvent): void => {
            dataHandler?.click(event);
        };
        finalclick.isGuardOK = (_event: MouseEvent): boolean => (this.countClicks + 1) === this.nbClicks;

        new TimeoutTransition(clicked, timeouted, () => 1000);
    }
}

interface ClicksFSMHandler extends FSMDataHandler {
    click(evt: MouseEvent): void;
}


export class Clicks extends InteractionBase<PointsData, PointsDataImpl, ClicksFSM> {
    private readonly handler: ClicksFSMHandler;

    /**
     * Creates the clicks interaction
     * @param numberClicks - The number of clicks expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public constructor(numberClicks: number) {
        super(new ClicksFSM(numberClicks), new PointsDataImpl());

        this.handler = {
            "click": (evt: MouseEvent): void => {
                const pt = new PointDataImpl();
                pt.setPointData(evt.clientX, evt.clientY, evt.screenX, evt.screenY,
                    evt.button, evt.target ?? undefined, evt.currentTarget ?? undefined);
                pt.setModifiersData(evt);
                this.data.addPoint(pt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }
}
