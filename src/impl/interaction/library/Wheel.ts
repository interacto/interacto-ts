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
import {WheelTransition} from "../../fsm/WheelTransition";
import {InteractionBase} from "../InteractionBase";
import {WheelDataImpl} from "../WheelDataImpl";
import type {WheelData} from "../../../api/interaction/WheelData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

interface WheelFSMHandler extends FSMDataHandler {
    initToMoved(event: WheelEvent): void;
}

/**
 * The FSM for wheel interactions
 * @category FSM
 */
export class WheelFSM extends FSMImpl<WheelFSMHandler> {
    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(logger: Logger, dataHandler: WheelFSMHandler) {
        super(logger, dataHandler);

        new WheelTransition(this.initState, this.addTerminalState("moved"),
            (evt: WheelEvent): void => {
                this.dataHandler?.initToMoved(evt);
            });
    }
}

/**
 * The mouse wheel interaction
 * @category Interaction Library
 */
export class Wheel extends InteractionBase<WheelData, WheelDataImpl, WheelFSM> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param fsm - The optional FSM provided for the interaction
     * @param data - The interaction data to use
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, fsm?: WheelFSM, data?: WheelDataImpl, name?: string) {
        const handler: WheelFSMHandler = {
            "initToMoved": (evt: WheelEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new WheelFSM(logger, handler), data ?? new WheelDataImpl(), logger, name ?? Wheel.name);
    }
}
