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
import {TransitionBase} from "./TransitionBase";
import {isCheckBox} from "./Events";
import type {EventType} from "../../api/fsm/EventType";

/**
 * An FSM transition for the CheckBox HTML element.
 */
export class BoxCheckPressedTransition extends TransitionBase<Event> {

    /**
     * Creates the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState,
                       action?: (evt: Event) => void, guard?: (evt: Event) => boolean) {
        super(srcState, tgtState, action, guard);
    }

    public accept(event: Event): event is Event {
        return event.currentTarget !== null && isCheckBox(event.currentTarget);
    }

    public getAcceptedEvents(): ReadonlyArray<EventType> {
        return ["input"];
    }
}
