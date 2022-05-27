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
import {TerminalState} from "../../fsm/TerminalState";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {WheelTransition} from "../../fsm/WheelTransition";
import {WheelDataImpl} from "../WheelDataImpl";
import type {WheelData} from "../../../api/interaction/WheelData";

/**
 * The FSM for wheel interactions
 */
export class WheelFSM extends FSMImpl<WheelFSMHandler> {
    /**
     * Creates the FSM
     */
    public constructor(dataHandler: WheelFSMHandler) {
        super(dataHandler);

        const moved = new TerminalState(this, "moved");
        this.addState(moved);

        const move = new WheelTransition(this.initState, moved);
        move.action = (event: WheelEvent): void => {
            this.dataHandler?.initToMoved(event);
        };
    }
}

interface WheelFSMHandler extends FSMDataHandler {
    initToMoved(event: WheelEvent): void;
}

export class Wheel extends InteractionBase<WheelData, WheelDataImpl, WheelFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(fsm?: WheelFSM, data?: WheelDataImpl) {
        const handler: WheelFSMHandler = {
            "initToMoved": (evt: WheelEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new WheelFSM(handler), data ?? new WheelDataImpl());
    }
}
