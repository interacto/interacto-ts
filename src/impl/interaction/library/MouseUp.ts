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
import type {PointData} from "../../../api/interaction/PointData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import {MouseUpTransition} from "../../fsm/MouseUpTransition";

export class MouseUpFSM extends FSMImpl<MouseUpFSMHandler> {
    public constructor(dataHandler: MouseUpFSMHandler) {
        super(dataHandler);

        const released: TerminalState = new TerminalState(this, "released");
        this.addState(released);

        const release = new MouseUpTransition(this.initState, released);
        release.action = (event: MouseEvent): void => {
            this.dataHandler?.initToPress(event);
        };
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
    public constructor() {
        const handler: MouseUpFSMHandler = {
            "initToPress": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseUpFSM(handler), new PointDataImpl());
    }
}
