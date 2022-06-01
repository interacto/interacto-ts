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
import {ClickTransition} from "../../fsm/ClickTransition";
import type {PointData} from "../../../api/interaction/PointData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM for click interactions
 */
export class ClickFSM extends FSMImpl<ClickFSMHandler> {
    private checkButton?: number;

    /**
     * Creates the FSM
     */
    public constructor(logger: Logger, dataHandler?: ClickFSMHandler) {
        super(logger, dataHandler);

        new ClickTransition(this.initState, this.addTerminalState("clicked"),
            (evt: MouseEvent): void => {
                this.setCheckButton(evt.button);
                this.dataHandler?.initToClicked(evt);
            },
            (evt: MouseEvent): boolean => this.checkButton === undefined || evt.button === this.checkButton);
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

interface ClickFSMHandler extends FSMDataHandler {
    initToClicked(event: MouseEvent): void;
}

export class Click extends InteractionBase<PointData, PointDataImpl, ClickFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(logger: Logger, fsm?: ClickFSM, data?: PointDataImpl) {
        super(fsm ?? new ClickFSM(logger), data ?? new PointDataImpl(), logger);
        this.fsm.dataHandler = {
            "initToClicked": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };
    }
}
