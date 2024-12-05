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
import {MouseTransition} from "../../fsm/MouseTransition";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM for click interactions
 * @category FSM
 */
export class ClickFSM extends FSMImpl {
    private checkButton: number | undefined;

    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a click
     * @param toleranceMove - The accepted number of pixel moves between the pressure and the release of the click
     */
    public constructor(logger: Logger, action?: (evt: MouseEvent) => void, toleranceMove?: number) {
        super(logger);

        const down = this.addStdState("down");
        const clicked = this.addTerminalState("clicked");

        this.startingState = clicked;

        let firstX = 0;
        let firstY = 0;

        new MouseTransition(this.initState, down, "mousedown",
            (evt: MouseEvent): void => {
                firstX = evt.clientX;
                firstY = evt.clientY;
                this.setCheckButton(evt.button);
            },
            (evt: MouseEvent): boolean => this.checkButton === undefined || evt.button === this.checkButton);

        new MouseTransition(down, clicked, "mouseup", action,
            (evt: MouseEvent): boolean => this.checkButton === undefined || evt.button === this.checkButton);

        if (toleranceMove !== undefined) {
            new MouseTransition(down, this.addCancellingState("moved"), "mousemove", undefined,
                evt => Math.abs(firstX - evt.clientX) > toleranceMove || Math.abs(firstY - evt.clientY) > toleranceMove);
        }
    }

    public getCheckButton(): number {
        return this.checkButton ?? -1;
    }

    public setCheckButton(buttonToCheck: number): void {
        if (this.checkButton === undefined) {
            this.checkButton = buttonToCheck;
        }
    }

    public override reinit(): void {
        super.reinit();
        this.checkButton = undefined;
    }
}

/**
 * The click interaction.
 * @category Interaction Library
 */
export class Click extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param fsm - The optional FSM provided for the interaction
     * @param data - The interaction data to use
     * @param name - The name of the user interaction
     * @param toleranceMove - The accepted number of pixel moves between the pressure and the release of the click
     */
    public constructor(logger: Logger, fsm?: ClickFSM, data?: PointDataImpl, name?: string, toleranceMove?: number) {
        const theFSM = fsm ?? new ClickFSM(logger, (evt: MouseEvent): void => {
            this._data.copy(evt);
        }, toleranceMove);
        super(theFSM, data ?? new PointDataImpl(), logger, name ?? Click.name);
    }
}
