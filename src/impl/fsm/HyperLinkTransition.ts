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

import {isHyperLink} from "./Events";
import {TransitionBase} from "./TransitionBase";
import type {EventType} from "../../api/fsm/EventType";

/**
 * An FSM transition for the Hyperlink.
 * @category FSM Transition
 */
export class HyperLinkTransition extends TransitionBase<Event> {
    private static readonly acceptedEvents: ReadonlySet<EventType> = new Set(["click", "auxclick"]);

    public accept(event: Event): event is Event {
        return event.currentTarget !== null && isHyperLink(event.currentTarget);
    }

    public getAcceptedEvents(): ReadonlySet<EventType> {
        return HyperLinkTransition.acceptedEvents;
    }
}
