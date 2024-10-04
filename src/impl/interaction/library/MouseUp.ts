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
 * The FSM of the mouse up interaction
 * @category FSM
 */
export class MouseUpFSM extends FSMImpl {
    /**
     * Creates the FSM
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a mouse up
     */
    public constructor(logger: Logger, action: (event: MouseEvent) => void) {
        super(logger);
        new MouseTransition(this.initState, this.addTerminalState("released"), "mouseup", action);
    }
}

/**
 * A user interaction for releasing a mouse button.
 * @category Interaction Library
 */
export class MouseUp extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (evt: MouseEvent): void => {
            this._data.copy(evt);
        };
        super(new MouseUpFSM(logger, action), new PointDataImpl(), logger, name ?? MouseUp.name);
    }
}
