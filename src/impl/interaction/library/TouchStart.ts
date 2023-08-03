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

import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import type {Logger} from "../../../api/logging/Logger";
import {TouchTransition} from "../../fsm/TouchTransition";
import {TouchDataImpl} from "../TouchDataImpl";
import type {TouchData} from "../../../interacto";

class TouchStartFSM extends FSMImpl<TouchStartFSMHandler> {
    public constructor(logger: Logger, dataHandler: TouchStartFSMHandler) {
        super(logger, dataHandler);

        new TouchTransition(this.initState, this.addTerminalState("touched"), "touchstart",
            (event: TouchEvent): void => {
                this.dataHandler?.initToTouch(event);
            });
    }
}

interface TouchStartFSMHandler extends FSMDataHandler {
    initToTouch(event: TouchEvent): void;
}

/**
 * A user interaction for touching down
 */
export class TouchStart extends InteractionBase<TouchData, TouchDataImpl, TouchStartFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(logger: Logger) {
        const handler: TouchStartFSMHandler = {
            "initToTouch": (evt: TouchEvent): void => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this._data.copy(TouchDataImpl.mergeTouchEventData(evt.changedTouches[0]!, evt, Array.from(evt.touches)));
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new TouchStartFSM(logger, handler), new TouchDataImpl(), logger);
    }
}
