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
import {Optional} from "../util/Optional";

export abstract class Transition {
    public readonly src: OutputState;

    public readonly tgt: InputState;

    protected constructor(srcState: OutputState, tgtState: InputState) {
        this.src = srcState;
        this.tgt = tgtState;
        this.src.addTransition(this);
    }

    public execute(event: Event): Optional<InputState> {
        if (this.accept(event) && this.isGuardOK(event)) {
            this.src.getFSM().stopCurrentTimeout();
            this.action(event);
            this.src.exit();
            this.tgt.enter();
            return Optional.of<InputState>(this.tgt);
        }
        return Optional.empty<InputState>();
    }

    protected action(event: Event | undefined): void {
    }

    public abstract accept(event: Event): boolean;

    public abstract isGuardOK(event: Event): boolean;

    public abstract getAcceptedEvents(): Set<string>;

    /**
     * Clean the transition when not used anymore.
     */
    public uninstall(): void {
    }
}
