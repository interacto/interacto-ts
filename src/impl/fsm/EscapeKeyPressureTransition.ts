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

import {KeyCode} from "./Events";
import {KeyTransition} from "./KeyTransition";
import type {InputState} from "../../api/fsm/InputState";
import type {OutputState} from "../../api/fsm/OutputState";

/**
 * This transition should be used to cancel an interaction using key ESCAPE.
 * @category FSM Transition
 */
export class EscapeKeyPressureTransition extends KeyTransition {
    public constructor(srcState: OutputState, tgtState: InputState, action?: (evt: KeyboardEvent) => void) {
        super(srcState, tgtState, "keydown", action,
            (evt: KeyboardEvent) => evt.code === "Escape" || evt.code === String(KeyCode.escape));
    }
}
