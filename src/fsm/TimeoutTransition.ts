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

import { Transition } from "./Transition";
import { OutputState } from "./OutputState";
import { InputState } from "./InputState";
import { Optional } from "../util/Optional";

export class TimeoutTransition extends Transition {
    /**
     * The timeoutDuration in ms.
     */
    private readonly timeoutDuration: () => number;

    /**
     * The current thread in progress.
     */
    private timeoutThread: NodeJS.Timer | undefined;

    private timeouted: boolean;

    public constructor(srcState: OutputState, tgtState: InputState, timeout: () => number) {
        super(srcState, tgtState);
        this.timeouted = false;
        this.timeoutDuration = timeout;
        this.timeouted = false;
    }

    /**
     * Launches the timer.
     */
    public startTimeout(): void {
        if (this.timeoutThread === undefined) {
            const time = this.timeoutDuration();
            if (time > 0) {
                this.timeoutThread = setTimeout(() => {
                    this.timeouted = true;
                    this.src.getFSM().onTimeout();
                }, time);
            }
        }
    }

    /**
     * Stops the timer.
     */
    public stopTimeout(): void {
        if (this.timeoutThread !== undefined) {
            clearTimeout(this.timeoutThread);
            this.timeoutThread = undefined;
        }
    }

    /**
     *
     * @param {*} event
     * @return {boolean}
     */
    public accept(event: Event | undefined): boolean {
        return this.timeouted;
    }

    /**
     *
     * @param {*} event
     * @return {boolean}
     */
    public isGuardOK(event: Event | undefined): boolean {
        return this.timeouted;
    }

    public execute(event?: Event): Optional<InputState> {
        try {
            if (this.accept(event) && this.isGuardOK(event)) {
                this.src.exit();
                this.action(event);
                this.tgt.enter();
                this.timeouted = false;
                return Optional.of(this.tgt);
            }
            return Optional.empty<InputState>();
        } catch (ex) {
            this.timeouted = false;
            throw ex;
        }
    }

    public getAcceptedEvents(): Set<string> {
        return new Set();
    }
}
