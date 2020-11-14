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
import {isColorChoice} from "./Events";
import {TransitionBase} from "./TransitionBase";
import {EventType} from "../../api/fsm/EventType";

/**
 * An FSM transition for the ColorPicked HTML element.
 */
export class ColorPickedTransition extends TransitionBase<Event> {

    /**
     * Creates the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    public accept(event: Event): event is Event {
        return event.target !== null && isColorChoice(event.target);
    }

    public getAcceptedEvents(): Array<EventType> {
        return ["input"];
    }
}
