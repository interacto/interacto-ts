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

import {isCheckBox} from "./Events";
import {TransitionBase} from "./TransitionBase";
import type {EventType} from "../../api/fsm/EventType";
import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";

/**
 * An FSM transition for the CheckBox HTML element.
 * @category FSM Transition
 */
export class BoxCheckPressedTransition extends TransitionBase<InputEvent> {
    private static readonly acceptedEvents: ReadonlySet<EventType> = new Set(["input"]);

    /**
     * Creates the transition.
     * @param srcState - The source state of the transition
     * @param tgtState - The output state of the transition
     * @param action - The action to execute when going through the transition
     * @param guard - The guard to fulfil to execute the transition
     */
    public constructor(srcState: OutputState, tgtState: InputState,
                       action?: (evt: InputEvent) => void, guard?: (evt: InputEvent) => boolean) {
        super(srcState, tgtState, action, guard);
    }

    public accept(event: Event): event is InputEvent {
        return event.currentTarget !== null && isCheckBox(event.currentTarget);
    }

    public getAcceptedEvents(): ReadonlySet<EventType> {
        return BoxCheckPressedTransition.acceptedEvents;
    }
}
