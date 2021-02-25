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
import {PressureTransition} from "../../fsm/PressureTransition";
import type {PointData} from "../../../api/interaction/PointData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";

export class PressFSM extends FSMImpl {
    public buildFSM(dataHandler?: PressFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");
        this.addState(pressed);

        const pressure = new PressureTransition(this.initState, pressed);
        pressure.action = (event: MouseEvent): void => {
            dataHandler?.initToPress(event);
        };
    }
}

interface PressFSMHandler extends FSMDataHandler {
    initToPress(event: MouseEvent): void;
}

/**
 * A user interaction for pressing down the mouse button.
 */
export class Press extends InteractionBase<PointData, PointDataImpl, PressFSM> {
    /**
     * Creates the interaction.
     */
    private readonly handler: PressFSMHandler;

    public constructor() {
        super(new PressFSM(), new PointDataImpl());

        this.handler = {
            "initToPress": (evt: MouseEvent): void => {
                this.data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }
}
