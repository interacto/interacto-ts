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

import {OutputState} from "../../api/fsm/OutputState";
import {InputState} from "../../api/fsm/InputState";
import {Transition} from "../../api/fsm/Transition";

/**
 * The base implementation of a FSM transition.
 */
export abstract class TransitionBase<E extends Event> implements Transition<E> {
    public readonly src: OutputState;

    public readonly tgt: InputState;

    /**
     * Creates the transition.
     * @param srcState The source state of the transition.
     * @param tgtState The output state of the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState) {
        this.src = srcState;
        this.tgt = tgtState;
        this.src.addTransition(this);
    }

    public execute(event: Event): InputState | undefined {
        if (this.accept(event) && this.isGuardOK(event)) {
            this.src.getFSM().stopCurrentTimeout();
            this.action(event);
            this.src.exit();
            this.tgt.enter();
            return this.tgt;
        }
        return undefined;
    }

    public action(_event?: E): void {
    }

    public abstract accept(event: Event): event is E;

    public isGuardOK(_event: E): boolean {
        return true;
    }

    public abstract getAcceptedEvents(): Set<string>;

    public getTarget(): InputState {
        return this.tgt;
    }

    public uninstall(): void {
    }
}
