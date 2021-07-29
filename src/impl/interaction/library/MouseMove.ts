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
import {MouseMoveTransition} from "../../fsm/MouseMoveTransition";

/**
 * The FSM for mouseover interactions
 */
export class MouseMoveFSM extends FSMImpl {

    /**
     * Creates the FSM
     */
    public constructor() {
        super();
    }

    public override buildFSM(dataHandler?: MouseMoveFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const moved = new TerminalState(this, "moved");
        this.addState(moved);

        const move = new MouseMoveTransition(this.initState, moved);
        move.action = (event: MouseEvent): void => {
            dataHandler?.onMove(event);
        };
    }
}

interface MouseMoveFSMHandler extends FSMDataHandler {
    onMove(event: MouseEvent): void;
}

export class MouseMove extends InteractionBase<PointData, PointDataImpl, MouseMoveFSM> {
    private readonly handler: MouseMoveFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new MouseMoveFSM(), new PointDataImpl());

        this.handler = {
            "onMove": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }
}
