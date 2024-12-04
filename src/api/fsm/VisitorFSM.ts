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

import type {ConcurrentFSM} from "./ConcurrentFSM";
import type {FSM} from "./FSM";
import type {InputState} from "./InputState";
import type {OutputState} from "./OutputState";
import type {State} from "./State";
import type {SubFSMTransition} from "./SubFSMTransition";
import type {Transition} from "./Transition";

/**
 * The main interface for visiting FSMs.
 * @category API FSM
 */
export interface VisitorFSM {
    visitFSM(fsm: FSM): void;

    visitAndConcurrentFSM(fsm: ConcurrentFSM<FSM>): void;

    visitXOrConcurrentFSM(fsm: ConcurrentFSM<FSM>): void;

    visitState(state: OutputState & State): void;

    visitInitState(state: OutputState & State): void;

    visitCancellingState(state: InputState & State): void;

    visitTerminalState(state: InputState & State): void;

    visitTransition(transition: Transition<Event>): void;

    visitTimeoutTransition(transition: Transition<Event>): void;

    visitSubFSMTransition(transition: SubFSMTransition): void;
}
