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

import {StateBase} from "./StateBase";
import {InputState} from "../../api/fsm/InputState";
import {FSM} from "../../api/fsm/FSM";

/**
 * A state of an FSM.
 * A cancelling state cancels the FSM of a user interaction.
 */
export class CancellingState extends StateBase implements InputState {
    /**
     * Creates the state.
     * @param stateMachine The FSM that will contain the state.
     * @param stateName The name of this state.
     */
    public constructor(stateMachine: FSM, stateName: string) {
        super(stateMachine, stateName);
    }

    public enter(): void {
        this.fsm.onCancelling();
    }

    public uninstall(): void {
    }
}
