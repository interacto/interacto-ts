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
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

interface MouseMoveFSMHandler extends FSMDataHandler {
    onMove(event: MouseEvent): void;
}

/**
 * The FSM for mouseover interactions
 */
export class MouseMoveFSM extends FSMImpl<MouseMoveFSMHandler> {
    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(logger: Logger, dataHandler: MouseMoveFSMHandler) {
        super(logger, dataHandler);

        new MouseTransition(this.initState, this.addTerminalState("moved"), "mousemove",
            (event: MouseEvent): void => {
                this.dataHandler?.onMove(event);
            });
    }
}

/**
 * The mouse move interaction. Corresponds to the single event MouseMove
 */
export class MouseMove extends InteractionBase<PointData, PointDataImpl, MouseMoveFSM> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const handler: MouseMoveFSMHandler = {
            "onMove": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseMoveFSM(logger, handler), new PointDataImpl(), logger, name ?? MouseMove.name);
    }
}
