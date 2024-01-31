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

import {FSMImpl} from "./FSMImpl";
import {StdState} from "./StdState";
import {SubFSMTransition} from "./SubFSMTransition";
import {TerminalState} from "./TerminalState";
import type {FSMDataHandler} from "./FSMDataHandler";
import type {FSM} from "../../api/fsm/FSM";
import type {OutputState} from "../../api/fsm/OutputState";
import type {Logger} from "../../api/logging/Logger";

/**
 * An FSM that executes a serie of sub-FSMs.
 * @category FSM
 */
export class ThenFSM<T extends FSMDataHandler> extends FSMImpl<T> {
    public constructor(fsms: Array<FSM>, logger: Logger) {
        super(logger);

        let currentState: OutputState = this.initState;
        const last = fsms.length - 1;

        for (const [i, fsm] of fsms.entries()) {
            if (i === last) {
                new SubFSMTransition(currentState, new TerminalState(this, i.toString()), fsm);
            } else {
                const state = new StdState(this, i.toString());
                new SubFSMTransition(currentState, state, fsm);
                currentState = state;
            }
        }
    }
}
