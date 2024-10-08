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

import {FSMImpl} from "../../fsm/FSMImpl";
import {TouchTransition} from "../../fsm/TouchTransition";
import {InteractionBase} from "../InteractionBase";
import {TouchDataImpl} from "../TouchDataImpl";
import type {TouchData} from "../../../api/interaction/TouchData";
import type {Logger} from "../../../api/logging/Logger";

class TouchStartFSM extends FSMImpl {
    public constructor(logger: Logger, action: (event: TouchEvent) => void) {
        super(logger);
        new TouchTransition(this.initState, this.addTerminalState("touched"), "touchstart", action);
    }
}

/**
 * A user interaction for touching down
 * @category Interaction Library
 */
export class TouchStart extends InteractionBase<TouchData, TouchDataImpl> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (evt: TouchEvent): void => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._data.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0]!, evt, Array.from(evt.touches)));
        };
        super(new TouchStartFSM(logger, action), new TouchDataImpl(), logger, name ?? TouchStart.name);
    }
}
