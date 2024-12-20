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

import type {FSM} from "../../api/fsm/FSM";
import type {State} from "../../api/fsm/State";
import type {VisitorFSM} from "../../api/fsm/VisitorFSM";

/**
 * The base implementation of the State interface.
 * @category FSM
 */
export abstract class StateBase implements State {
    public readonly fsm: FSM;

    public readonly name: string;

    /**
     * Creates the state.
     * @param stateMachine - The FSM that will contain the state.
     * @param stateName - The name of this state.
     */
    public constructor(stateMachine: FSM, stateName: string) {
        this.fsm = stateMachine;
        this.name = stateName;
    }

    public checkStartingState(): void {
        if (!this.fsm.started && this.fsm.startingState === this) {
            this.fsm.onStarting();
        }
    }

    public uninstall(): void {}

    public abstract acceptVisitor(visitor: VisitorFSM): void;
}
