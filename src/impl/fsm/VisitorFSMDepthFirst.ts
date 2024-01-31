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
import type {ConcurrentFSM} from "../../api/fsm/ConcurrentFSM";
import type {FSM} from "../../api/fsm/FSM";
import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";
import type {State} from "../../api/fsm/State";
import type {Transition} from "../../api/fsm/Transition";
import type {VisitorFSM} from "../../api/fsm/VisitorFSM";

/**
 * A depth-first implementation of the FSM visitor. No treatment here, just visiting.
 * To customize this visitor, extends it and override the different methods.
 * @category FSM
 */
export class VisitorFSMDepthFirst implements VisitorFSM {
    private readonly visited: Set<State>;

    public constructor() {
        this.visited = new Set();
    }

    public visitAndConcurrentFSM(fsm: ConcurrentFSM<FSM>): void {
        for (const concFSM of fsm.getAllConccurFSMs()) {
            concFSM.acceptVisitor(this);
        }
    }

    public visitXOrConcurrentFSM(fsm: ConcurrentFSM<FSM>): void {
        for (const concFSM of fsm.getAllConccurFSMs()) {
            concFSM.acceptVisitor(this);
        }
    }

    public visitInitState(state: OutputState & State): void {
        if (this.alreadyVisited(state)) {
            return;
        }
        for (const tr of state.transitions) {
            tr.acceptVisitor(this);
        }
    }

    public visitState(state: OutputState & State): void {
        if (this.alreadyVisited(state)) {
            return;
        }
        for (const tr of state.transitions) {
            tr.acceptVisitor(this);
        }
    }

    public visitCancellingState(_state: InputState & State): void {}

    public visitTerminalState(_state: InputState & State): void {}

    public visitFSM(fsm: FSM): void {
        fsm.initState.acceptVisitor(this);
    }

    public visitTransition(transition: Transition<Event>): void {
        transition.target.acceptVisitor(this);
    }

    public visitTimeoutTransition(transition: Transition<Event>): void {
        transition.target.acceptVisitor(this);
    }

    public clear(): void {
        this.visited.clear();
    }

    protected alreadyVisited(state: State): boolean {
        const already = this.visited.has(state);
        if (!already) {
            this.visited.add(state);
        }
        return already;
    }
}
