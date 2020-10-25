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

import {State} from "../../api/fsm/State";
import {FSM} from "../../api/fsm/FSM";

/**
 * The base implementation of the State interface.
 */
export abstract class StateBase implements State {
    protected readonly fsm: FSM;

    protected readonly name: string;

    /**
     * Creates the state.
     * @param stateMachine The FSM that will contain the state.
     * @param stateName The name of this state.
     */
    protected constructor(stateMachine: FSM, stateName: string) {
        this.fsm = stateMachine;
        this.name = stateName;
    }

    public checkStartingState(): void {
        if (!this.fsm.isStarted() && this.fsm.getStartingState() === this) {
            this.fsm.onStarting();
        }
    }

    public getName(): string {
        return this.name;
    }

    public getFSM(): FSM {
        return this.fsm;
    }

    public uninstall(): void {
    }
}
