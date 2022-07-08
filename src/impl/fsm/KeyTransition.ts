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

import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";
import {TransitionBase} from "./TransitionBase";
import type {EventType, KeyEventType} from "../../api/fsm/EventType";

/**
 * A transition for a keys.
 */
export class KeyTransition extends TransitionBase<KeyboardEvent> {
    private readonly keyType: KeyEventType;

    /**
     * Creates the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState, keyType: KeyEventType,
                       action?: (evt: Event) => void, guard?: (evt: Event) => boolean) {
        super(srcState, tgtState, action, guard);
        this.keyType = keyType;
    }

    public accept(event: Event): event is KeyboardEvent {
        return event instanceof KeyboardEvent && this.getAcceptedEvents().includes(event.type as EventType);
    }

    public getAcceptedEvents(): ReadonlyArray<EventType> {
        return [this.keyType];
    }
}
