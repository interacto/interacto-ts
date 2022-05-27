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
import {MouseOutTransition} from "../../fsm/MouseOutTransition";
import type {TransitionBase} from "../../fsm/TransitionBase";
import {MouseLeaveTransition} from "../../fsm/MouseLeaveTransition";

/**
 * The FSM for mouseout interactions
 */
export class MouseLeaveFSM extends FSMImpl<MouseLeaveFSMHandler> {
    /**
     * Indicates if event bubbling is enabled for the interaction
     */
    private readonly withBubbling: boolean;

    /**
     * Creates the FSM
     */
    public constructor(withBubbling: boolean, dataHandler: MouseLeaveFSMHandler) {
        super(dataHandler);
        this.withBubbling = withBubbling;

        const exited = new TerminalState(this, "exited");
        this.addState(exited);

        let exit: TransitionBase<MouseEvent>;
        if (this.withBubbling) {
            exit = new MouseOutTransition(this.initState, exited);
        } else {
            exit = new MouseLeaveTransition(this.initState, exited);
        }
        exit.action = (event: MouseEvent): void => {
            this.dataHandler?.onExit(event);
        };
    }
}

interface MouseLeaveFSMHandler extends FSMDataHandler {
    onExit(event: MouseEvent): void;
}

export class MouseLeave extends InteractionBase<PointData, PointDataImpl, MouseLeaveFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(withBubbling: boolean) {
        const handler: MouseLeaveFSMHandler = {
            "onExit": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new MouseLeaveFSM(withBubbling, handler), new PointDataImpl());
    }
}
