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
import type {PointData} from "../../../api/interaction/PointData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import type {Logger} from "../../../api/logging/Logger";
import {MouseTransition} from "../../fsm/MouseTransition";

export class MouseUpFSM extends FSMImpl<MouseUpFSMHandler> {
    public constructor(logger: Logger, dataHandler: MouseUpFSMHandler) {
        super(logger, dataHandler);

        new MouseTransition(this.initState, this.addTerminalState("released"), "mouseup",
            (event: MouseEvent): void => {
                this.dataHandler?.initToPress(event);
            });
    }
}

interface MouseUpFSMHandler extends FSMDataHandler {
    initToPress(event: MouseEvent): void;
}

/**
 * A user interaction for releasing a mouse button.
 */
export class MouseUp extends InteractionBase<PointData, PointDataImpl, MouseUpFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(logger: Logger, name?: string) {
        const handler: MouseUpFSMHandler = {
            "initToPress": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseUpFSM(logger, handler), new PointDataImpl(), logger, name ?? MouseUp.name);
    }
}
