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
import {TerminalState} from "../../fsm/TerminalState";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import type {MouseEvtFSMHandler} from "./LongMouseDown";
import type {PointData} from "../../../api/interaction/PointData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM for mouseout interactions
 * @category FSM
 */
export class MouseLeaveFSM extends FSMImpl {
    /**
     * Indicates if event bubbling is enabled for the interaction
     */
    private readonly withBubbling: boolean;

    /**
     * Creates the FSM
     * @param withBubbling - True: event bubbling will be done
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(withBubbling: boolean, logger: Logger, dataHandler: MouseEvtFSMHandler) {
        super(logger, dataHandler);
        this.withBubbling = withBubbling;

        const exited = new TerminalState(this, "exited");
        const action = (event: MouseEvent): void => {
            dataHandler.mouseEvt(event);
        };

        if (this.withBubbling) {
            new MouseTransition(this.initState, exited, "mouseout", action);
        } else {
            new MouseTransition(this.initState, exited, "mouseleave", action);
        }
    }
}

/**
 * The mouse leave interaction. Corresponds to the single event MouseLeave
 * @category Interaction Library
 */
export class MouseLeave extends InteractionBase<PointData, PointDataImpl> {
    /**
     * Creates the interaction.
     * @param withBubbling - True: the event bullebing will be done
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(withBubbling: boolean, logger: Logger, name?: string) {
        const handler: MouseEvtFSMHandler = {
            "mouseEvt": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseLeaveFSM(withBubbling, logger, handler), new PointDataImpl(), logger, name ?? MouseLeave.name);
    }
}
