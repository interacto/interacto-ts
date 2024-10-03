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
import type {MouseEvtFSMHandler} from "./LongMouseDown";
import type {PointData} from "../../../api/interaction/PointData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM for click interactions
 * @category FSM
 */
export class ClickFSM extends FSMImpl<MouseEvtFSMHandler> {
    private checkButton: number | undefined;

    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(logger: Logger, dataHandler?: MouseEvtFSMHandler) {
        super(logger, dataHandler);

        new ClickTransition(this.initState, this.addTerminalState("clicked"),
            (evt: MouseEvent): void => {
                this.setCheckButton(evt.button);
                this.dataHandler?.mouseEvt(evt);
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
export class Click extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param fsm - The optional FSM provided for the interaction
     * @param data - The interaction data to use
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, fsm?: ClickFSM, data?: PointDataImpl, name?: string) {
        const theFSM = fsm ?? new ClickFSM(logger);
        super(theFSM, data ?? new PointDataImpl(), logger, name ?? Click.name);
        theFSM.dataHandler = {
            "mouseEvt": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };
    }
}
