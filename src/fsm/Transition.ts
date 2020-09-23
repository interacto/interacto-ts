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

import {OutputState} from "./OutputState";
import {InputState} from "./InputState";

/**
 * The base implementation of a FSM transition.
 */
export abstract class Transition {
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

    /**
     * Executes the transition.
     * @param event The event to process.
     * @return The potential output state.
     * @throws CancelFSMException If the execution cancels the FSM execution.
     */
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

    public action(_event?: Event): void {
    }

    public abstract accept(event: Event): boolean;

    public abstract isGuardOK(event: Event): boolean;

    /**
     * @return The set of events accepted by the transition.
     */
    public abstract getAcceptedEvents(): Set<string>;

    /**
     * Clean the transition when not used anymore.
     */
    public uninstall(): void {
    }
}
