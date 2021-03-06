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
import type {OutputState} from "../../api/fsm/OutputState";
import type {FSM} from "../../api/fsm/FSM";
import type {Transition} from "../../api/fsm/Transition";

/**
 * Base implementation of the OutputState interface.
 */
export abstract class OutputStateBase extends StateBase implements OutputState {
    protected readonly _transitions: Array<Transition<Event>>;

    /**
     * Creates the state.
     * @param stateMachine - The FSM that will contain the state.
     * @param stateName - The name of this state.
     */
    protected constructor(stateMachine: FSM, stateName: string) {
        super(stateMachine, stateName);
        this._transitions = [];
    }

    public process(event: Event): boolean {
        return this.transitions.find(tr => {
            try {
                return tr.execute(event) !== undefined;
            } catch (ignored: unknown) {
                // Already processed
                return false;
            }
        }) !== undefined;
    }

    public clearTransitions(): void {
        this._transitions.length = 0;
    }

    public get transitions(): ReadonlyArray<Transition<Event>> {
        return [...this._transitions];
    }

    public addTransition(tr: Transition<Event>): void {
        this._transitions.push(tr);
    }

    public abstract exit(): void;

    public override uninstall(): void {
        super.uninstall();
        this.transitions.forEach(tr => {
            tr.uninstall();
        });
        this._transitions.length = 0;
    }
}
