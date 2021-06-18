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
import {MousemoveTransition} from "../../fsm/MousemoveTransition";

/**
 * The FSM for mouseover interactions
 */
export class MousemoveFSM extends FSMImpl {

    /**
     * Creates the FSM
     */
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: MousemoveFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const moved = new TerminalState(this, "moved");
        this.addState(moved);

        const move = new MousemoveTransition(this.initState, moved);
        move.action = (event: MouseEvent): void => {
            dataHandler?.onMove(event);
        };
    }
}

interface MousemoveFSMHandler extends FSMDataHandler {
    onMove(event: MouseEvent): void;
}

export class Mousemove extends InteractionBase<PointData, PointDataImpl, MousemoveFSM> {
    private readonly handler: MousemoveFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new MousemoveFSM(), new PointDataImpl());

        this.handler = {
            "onMove": (evt: MouseEvent): void => {
                this.data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }
}
