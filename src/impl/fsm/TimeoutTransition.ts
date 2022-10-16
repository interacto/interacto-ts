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

import {TransitionBase} from "./TransitionBase";
import type {OutputState} from "../../api/fsm/OutputState";
import type {InputState} from "../../api/fsm/InputState";
import type {EventType} from "../../api/fsm/EventType";
import type {Logger} from "../../api/logging/Logger";

/**
 * A timeout transition is an FSM transition that is not executed by an event:
 * the FSM goes through such a transition on a timeout.
 */
export class TimeoutTransition extends TransitionBase<Event> {
    /**
     * The timeoutDuration in ms.
     */
    private readonly timeoutDuration: () => number;

    private readonly logger?: Logger;

    /**
     * The current thread in progress.
     */
    private timeoutThread?: number;

    private timeouted: boolean;

    /**
     * Creates the timeout transition.
     * @param srcState - The source state of the transition.
     * @param tgtState - The output state of the transition.
     * @param timeout - The function that returns the timeout value in ms.
     * @param logger - The logger to use.
     */
    public constructor(srcState: OutputState, tgtState: InputState, timeout: () => number, logger?: Logger,
                       action?: (evt: Event) => void) {
        super(srcState, tgtState, action, () => this.timeouted);
        this.logger = logger;
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
            // If incorrect duration value, no thread created
            if (time <= 0) {
                this.src.fsm.onTimeout();
                return;
            }

            this.timeoutThread = window.setTimeout(() => {
                try {
                    this.timeouted = true;
                    this.src.fsm.onTimeout();
                } catch (ex: unknown) {
                    this.logger?.logInteractionErr("Exception on timeout of a timeout transition", ex);
                }
            }, time);
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

    public accept(event?: Event): event is Event {
        return this.timeouted;
    }

    public override execute(event?: Event): InputState | undefined {
        try {
            if (this.accept(event) && this.guard(event)) {
                this.src.exit();
                this.action(event);
                this.tgt.enter();
                this.timeouted = false;
                return this.tgt;
            }
            return undefined;
        } catch (ex: unknown) {
            this.timeouted = false;
            throw ex;
        }
    }

    public getAcceptedEvents(): ReadonlyArray<EventType> {
        return [];
    }
}
