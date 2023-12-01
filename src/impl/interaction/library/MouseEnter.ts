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

interface MouseEnterFSMHandler extends FSMDataHandler {
    onEnter(event: MouseEvent): void;
}

/**
 * The FSM for mouseover interactions
 */
export class MouseEnterFSM extends FSMImpl<MouseEnterFSMHandler> {
    /**
     * Indicates if event bubbling is enabled for the interaction
     */
    private readonly withBubbling: boolean;

    /**
     * Creates the FSM
     */
    public constructor(withBubbling: boolean, logger: Logger, dataHandler: MouseEnterFSMHandler) {
        super(logger, dataHandler);
        this.withBubbling = withBubbling;

        const entered = this.addTerminalState("entered");
        const action = (event: MouseEvent): void => {
            this.dataHandler?.onEnter(event);
        };

        if (this.withBubbling) {
            new MouseTransition(this.initState, entered, "mouseover", action);
        } else {
            new MouseTransition(this.initState, entered, "mouseenter", action);
        }
    }
}

export class MouseEnter extends InteractionBase<PointData, PointDataImpl, MouseEnterFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(withBubbling: boolean, logger: Logger, name?: string) {
        const handler: MouseEnterFSMHandler = {
            "onEnter": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseEnterFSM(withBubbling, logger, handler), new PointDataImpl(), logger, name ?? MouseEnter.name);
    }
}
