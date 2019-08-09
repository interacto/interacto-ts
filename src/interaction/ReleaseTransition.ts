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

import {TSTransition} from "./TSTransition";
import {OutputState} from "../src-core/fsm/OutputState";
import {InputState} from "../src-core/fsm/InputState";
import {EventRegistrationToken} from "./Events";

/**
 * This transition corresponds to a release of a button of a pointing device.
 * @author Gwendal DIDOT
 */
export class ReleaseTransition extends TSTransition {

    /**
     * Defines a transition.
     * @param srcState The source state of the transition.
     * @param tgtState The srcObject state of the transition.
     */
    public constructor(srcState: OutputState<Event>, tgtState: InputState<Event>) {
        super(srcState, tgtState);
    }

    public accept(e: Event): boolean {
        return e instanceof MouseEvent && e.type === EventRegistrationToken.MouseUp ;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set([EventRegistrationToken.MouseUp]);
    }

    public isGuardOK(event: Event): boolean {
        return true;
    }
}
