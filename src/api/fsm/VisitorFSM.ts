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

import type {ConcurrentAndFSM} from "../../impl/fsm/ConcurrentAndFSM";
import type {ConcurrentXOrFSM} from "../../impl/fsm/ConcurrentXOrFSM";
import type {FSMDataHandler} from "../../impl/fsm/FSMDataHandler";
import type {TimeoutTransition} from "../../impl/fsm/TimeoutTransition";
import type {FSM} from "./FSM";
import type {InputState} from "./InputState";
import type {OutputState} from "./OutputState";
import type {State} from "./State";
import type {Transition} from "./Transition";

/**
 * The main interface for visiting FSMs.
 */
export interface VisitorFSM {
    visitFSM(fsm: FSM): void;

    visitAndConcurrentFSM(fsm: ConcurrentAndFSM<FSM, FSMDataHandler>): void;

    visitXOrConcurrentFSM(fsm: ConcurrentXOrFSM<FSM, FSMDataHandler>): void;

    visitState(state: OutputState & State): void;

    visitInitState(state: OutputState & State): void;

    visitCancellingState(state: InputState & State): void;

    visitTerminalState(state: InputState & State): void;

    visitTransition(transition: Transition<Event>): void;

    visitTimeoutTransition(transition: TimeoutTransition): void;
}
