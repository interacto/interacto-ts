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

import { FSM } from "./FSM";


/**
 * The base type of an FSM state.
 * @param <E> The type of events the FSM processes.
 */
export interface State {
    getName(): string;

    getFSM(): FSM;

    /**
     * Checks whether the starting state of the fsm is this state.
     * In this case, the fsm is notified about the starting of the FSM.
     * @throws CancelFSMException
     */
    checkStartingState(): void;

    uninstall(): void;
}

