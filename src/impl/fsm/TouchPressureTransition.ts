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

import {OutputState} from "../../api/fsm/OutputState";
import {InputState} from "../../api/fsm/InputState";
import {isEventType} from "./Events";
import {TransitionBase} from "./TransitionBase";
import {EventType} from "../../api/fsm/EventType";

/**
 * This transition defines a touch pressure.
 */
export class TouchPressureTransition extends TransitionBase<TouchEvent> {
    /**
     * Defines a transition.
     * @param srcState - The source state of the transition.
     * @param tgtState - The srcObject state of the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    public accept(evt: Event): evt is TouchEvent {
        return evt instanceof TouchEvent && isEventType(evt.type) && this.getAcceptedEvents().includes(evt.type);
    }

    public getAcceptedEvents(): Array<EventType> {
        return ["touchstart"];
    }
}
