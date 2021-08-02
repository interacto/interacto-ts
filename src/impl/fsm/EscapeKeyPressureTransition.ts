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
import {KeyCode} from "./Events";
import {KeyDownTransition} from "./KeyDownTransition";

/**
 * This transition should be used to cancel an interaction using key ESCAPE.
 */
export class EscapeKeyPressureTransition extends KeyDownTransition {
    public constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    public override isGuardOK(event: KeyboardEvent): boolean {
        return event.code === "Escape" || event.code === String(KeyCode.escape);
    }
}
