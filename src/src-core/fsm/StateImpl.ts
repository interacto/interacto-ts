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

import {State} from "./State";
import {FSM} from "./FSM";

export abstract class StateImpl<E> implements State<E> {
    protected readonly fsm: FSM<E>;

    protected readonly name: string;

    protected constructor(stateMachine: FSM<E>, stateName: string) {
        this.fsm = stateMachine;
        this.name = stateName;
    }

    public checkStartingState() {
        if (!this.fsm.isStarted() && this.fsm.startingState === this) {
            this.fsm.onStarting();
        }
    }

    /**
     *
     * @return {string}
     */
    public getName(): string {
        return this.name;
    }

    /**
     *
     * @return {FSM}
     */
    public getFSM(): FSM<E> {
        return this.fsm;
    }

    public uninstall(): void {
    }
}
