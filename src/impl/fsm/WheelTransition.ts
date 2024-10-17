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
import type {EventType} from "../../api/fsm/EventType";

/**
 * This transition corresponds to the user moving a mouse wheel or a similar input device.
 * @category FSM Transition
 */
export class WheelTransition extends TransitionBase<WheelEvent> {
    private static readonly acceptedEvents: ReadonlySet<EventType> = new Set(["wheel"]);

    public accept(event: Event): event is WheelEvent {
        return event instanceof WheelEvent && this.getAcceptedEvents().has(event.type as EventType);
    }

    public getAcceptedEvents(): ReadonlySet<EventType> {
        return WheelTransition.acceptedEvents;
    }
}
