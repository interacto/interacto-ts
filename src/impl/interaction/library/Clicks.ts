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

import {ClickTransition} from "../../fsm/ClickTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {InteractionBase} from "../InteractionBase";
import {MousePointsDataImpl} from "../MousePointsDataImpl";
import {PointDataImpl} from "../PointDataImpl";
import type {MousePointsData} from "../../../api/interaction/MousePointsData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM that defines the behavior of the clicks interaction
 * @category FSM
 */
export class ClicksFSM extends FSMImpl {
    private countClicks: number;

    private readonly nbClicks: number;

    /**
     * Creates the Clicks FSM
     * @param nbClicks - The number of clicks to manage
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a click
     */
    public constructor(nbClicks: number, logger: Logger, action: (evt: MouseEvent) => void) {
        super(logger);

        if (nbClicks <= 0) {
            throw new Error("The number of clicks must be greater than 1");
        }

        if (nbClicks === 1) {
            throw new Error("For a number of clicks that equals 1, use the Click interaction");
        }

        this.countClicks = 0;
        this.nbClicks = nbClicks;

        const clicked = this.addStdState("clicked");

        new ClickTransition(this.initState, clicked,
            (evt: MouseEvent): void => {
                this.countClicks++;
                action(evt);
            });

        new ClickTransition(clicked, clicked,
            (evt: MouseEvent): void => {
                this.countClicks++;
                action(evt);
            },
            (): boolean => (this.countClicks + 1) < this.nbClicks);

        new ClickTransition(clicked, this.addTerminalState("ended"),
            (evt: MouseEvent): void => {
                action(evt);
            },
            (): boolean => (this.countClicks + 1) === this.nbClicks);

        new TimeoutTransition(clicked, this.addCancellingState("timeouted"), () => 1000);
    }

    public override reinit(): void {
        super.reinit();
        this.countClicks = 0;
    }
}

/**
 * The clicks interaction. A user can click several times in different places.
 * @category Interaction Library
 */
export class Clicks extends InteractionBase<MousePointsData, MousePointsDataImpl> {
    /**
     * Creates the clicks interaction
     * @param numberClicks - The number of clicks expected to end the interaction.
     * If this number is not reached after a timeout, the interaction is cancelled.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(numberClicks: number, logger: Logger, name?: string) {
        const action = (evt: MouseEvent): void => {
            const pt = new PointDataImpl();
            pt.copy(evt);
            this._data.addPoint(pt);
        };
        super(new ClicksFSM(numberClicks, logger, action), new MousePointsDataImpl(), logger, name ?? Clicks.name);
    }
}
