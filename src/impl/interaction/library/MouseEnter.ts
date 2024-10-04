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
 * The FSM for mouseover interactions
 * @category FSM
 */
export class MouseEnterFSM extends FSMImpl {
    /**
     * Indicates if event bubbling is enabled for the interaction
     */
    private readonly withBubbling: boolean;

    /**
     * Creates the FSM
     * @param withBubbling - True: event bubbling will be done
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a mouse enter
     */
    public constructor(withBubbling: boolean, logger: Logger, action: (event: MouseEvent) => void) {
        super(logger);
        this.withBubbling = withBubbling;

        const entered = this.addTerminalState("entered");

        if (this.withBubbling) {
            new MouseTransition(this.initState, entered, "mouseover", action);
        } else {
            new MouseTransition(this.initState, entered, "mouseenter", action);
        }
    }
}

/**
 * The mouse enter interaction. Corresponds to the single event mouseEnter
 * @category Interaction Library
 */
export class MouseEnter extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the interaction.
     * @param withBubbling - True: the event bubbling will be done
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(withBubbling: boolean, logger: Logger, name?: string) {
        const action = (evt: MouseEvent): void => {
            this._data.copy(evt);
        };

        super(new MouseEnterFSM(withBubbling, logger, action), new PointDataImpl(), logger, name ?? MouseEnter.name);
    }
}
