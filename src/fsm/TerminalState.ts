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

import {StateImpl} from "./StateImpl";
import {InputState} from "./InputState";
import {FSM} from "./FSM";

export class TerminalState extends StateImpl implements InputState {
    public constructor(stateMachine: FSM, stateName: string) {
        super(stateMachine, stateName);
    }

    public checkStartingState(): void {
        if (!this.getFSM().isStarted() && this.getFSM().startingState === this) {
            this.getFSM().onStarting();
        }
    }

    public enter(): void {
        this.checkStartingState();
        this.fsm.onTerminating(this);
    }
}
