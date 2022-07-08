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

import type {OutputState} from "../../api/fsm/OutputState";
import type {InputState} from "../../api/fsm/InputState";
import type {Transition} from "../../api/fsm/Transition";
import type {EventType} from "../../api/fsm/EventType";

/**
 * The base implementation of a FSM transition.
 */
export abstract class TransitionBase<E extends Event> implements Transition<E> {
    public readonly src: OutputState;

    public readonly tgt: InputState;

    public readonly action: (evt: E) => void;

    public readonly guard: (evt: E) => boolean;

    /**
     * Creates the transition.
     * @param srcState - The source state of the transition.
     * @param tgtState - The output state of the transition.
     */
    protected constructor(srcState: OutputState, tgtState: InputState,
                          action?: (evt: E) => void, guard?: (evt: E) => boolean) {
        this.src = srcState;
        this.tgt = tgtState;
        this.action = action ?? ((): void => {
        });
        this.guard = guard ?? ((): boolean => true);
        this.src.addTransition(this);
    }

    public execute(event: Event): InputState | undefined {
        if (this.accept(event) && this.guard(event)) {
            this.src.fsm.stopCurrentTimeout();
            this.action(event);
            this.src.exit();
            this.tgt.enter();
            return this.tgt;
        }
        return undefined;
    }

    public abstract accept(event: Event): event is E;

    public abstract getAcceptedEvents(): ReadonlyArray<EventType>;

    public get target(): InputState {
        return this.tgt;
    }

    public uninstall(): void {
    }
}
