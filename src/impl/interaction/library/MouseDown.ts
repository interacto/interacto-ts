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

class MouseDownFSM extends FSMImpl<MouseDownFSMHandler> {
    public constructor(logger: Logger, dataHandler: MouseDownFSMHandler) {
        super(logger, dataHandler);

        new MouseTransition(this.initState, this.addTerminalState("pressed"), "mousedown",
            (event: MouseEvent): void => {
                this.dataHandler?.initToPress(event);
            });
    }
}

interface MouseDownFSMHandler extends FSMDataHandler {
    initToPress(event: MouseEvent): void;
}

/**
 * A user interaction for pressing down a mouse button.
 */
export class MouseDown extends InteractionBase<PointData, PointDataImpl, MouseDownFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(logger: Logger, name?: string) {
        const handler: MouseDownFSMHandler = {
            "initToPress": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseDownFSM(logger, handler), new PointDataImpl(), logger, name ?? MouseDown.name);
    }
}
