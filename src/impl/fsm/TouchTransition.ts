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
import type {EventType, TouchEventType} from "../../api/fsm/EventType";
import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";

/**
 * This transition defines a touch move.
 */
export class TouchTransition extends TransitionBase<TouchEvent> {
    private readonly acceptedEvents: ReadonlySet<EventType>;

    /**
     * Defines a transition.
     * @param srcState - The source state of the transition.
     * @param tgtState - The srcObject state of the transition.
     * @param eventType - The type of touch event
     * @param action - The action to execute when going through the transition
     * @param guard - The guard to fulfil to execute the transition
     */
    public constructor(srcState: OutputState, tgtState: InputState, eventType: TouchEventType,
                       action?: (evt: TouchEvent) => void, guard?: (evt: TouchEvent) => boolean) {
        super(srcState, tgtState, action, guard);
        this.acceptedEvents = new Set([eventType]);
    }

    public accept(evt: Event): evt is TouchEvent {
        return evt instanceof TouchEvent && this.getAcceptedEvents().has(evt.type as EventType);
    }

    public getAcceptedEvents(): ReadonlySet<EventType> {
        return this.acceptedEvents;
    }
}
