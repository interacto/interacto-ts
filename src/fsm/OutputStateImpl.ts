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

import { StateImpl } from "./StateImpl";
import { OutputState } from "./OutputState";
import { Transition } from "./Transition";
import { FSM } from "./FSM";

export abstract class OutputStateImpl extends StateImpl implements OutputState {
    protected readonly transitions: Array<Transition>;

    protected constructor(stateMachine: FSM, stateName: string) {
        super(stateMachine, stateName);
        this.transitions = [];
    }

    public process(event: Event): boolean {
        return this.getTransitions().find(tr => {
            try {
                if (tr.execute(event).isPresent()) {
                    return true;
                }
            } catch (ignored) {
                // Already processed
            }
            return false;
        }) !== undefined;
    }

    public checkStartingState(): void {
        if (!this.getFSM().isStarted() && this.getFSM().startingState === this) {
            this.getFSM().onStarting();
        }
    }

    public clearTransitions(): void {
        this.transitions.length = 0;
    }

    public getTransitions(): Array<Transition> {
        return [...this.transitions];
    }

    public addTransition(tr: Transition): void {
        this.transitions.push(tr);
    }

    public abstract exit(): void;

    public uninstall(): void {
        this.transitions.forEach(tr => tr.uninstall());
        this.transitions.length = 0;
    }
}
