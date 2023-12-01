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

import {MouseTransition} from "./MouseTransition";
import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";

/**
 * This transition corresponds to a pressure of a button of a pointing device.
 */
export class ClickTransition extends MouseTransition {
    /**
     * Creates the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState,
                       action?: (evt: MouseEvent) => void, guard?: (evt: MouseEvent) => boolean) {
        super(srcState, tgtState, ["click", "auxclick"], action, guard);
    }
}
