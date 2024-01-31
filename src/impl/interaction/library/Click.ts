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
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

interface ClickFSMHandler extends FSMDataHandler {
    initToClicked(event: MouseEvent): void;
}

/**
 * The FSM for click interactions
 * @category FSM
 */
export class ClickFSM extends FSMImpl<ClickFSMHandler> {
    private checkButton: number | undefined;

    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
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

/**
 * The click interaction.
 * @category Interaction Library
 */
export class Click extends InteractionBase<PointData, PointDataImpl, ClickFSM> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param fsm - The optional FSM provided for the interaction
     * @param data - The interaction data to use
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, fsm?: ClickFSM, data?: PointDataImpl, name?: string) {
        super(fsm ?? new ClickFSM(logger), data ?? new PointDataImpl(), logger, name ?? Click.name);
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
