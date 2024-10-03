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
import {KeyTransition} from "../../fsm/KeyTransition";
import {InteractionBase} from "../InteractionBase";
import {KeysDataImpl} from "../KeysDataImpl";
import type {KeysData} from "../../../api/interaction/KeysData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

/**
 * The data handler that makes the link between a single key event handler and an FSM
 */
export interface KeyEvtFSMHandler extends FSMDataHandler {
    onKeyEvt(event: KeyboardEvent): void;
}

/**
 * This interaction permits to define combo a key pressed that can be used to define shortcuts, etc.
 * @category FSM
 */
export class KeysDownFSM extends FSMImpl {
    private readonly currentCodes: Array<string>;

    /**
     * Creates the FSM.
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(logger: Logger, dataHandler: KeyEvtFSMHandler) {
        super(logger, dataHandler);
        this.currentCodes = [];

        const pressed = this.addStdState("pressed");

        const actionkp = (evt: KeyboardEvent): void => {
            this.currentCodes.push(evt.code);
            dataHandler.onKeyEvt(evt);
        };
        new KeyTransition(this.initState, pressed, "keydown", actionkp);

        new KeyTransition(pressed, pressed, "keydown", actionkp);

        new KeyTransition(pressed, this.addTerminalState("ended"), "keyup", undefined,
            (evt: KeyboardEvent): boolean => this.currentCodes.includes(evt.code));
    }

    public override reinit(): void {
        this.currentCodes.length = 0;
        super.reinit();
    }
}

/**
 * Several keys pressed at the same time.
 * Starts on a key pressure. Ends as soon as one of the pressed keys is released.
 * @category Interaction Library
 */
export class KeysDown extends InteractionBase<KeysData, KeysDataImpl> {
    /**
     * Creates the user interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const handler: KeyEvtFSMHandler = {
            "onKeyEvt": (event: KeyboardEvent): void => {
                this._data.addKey(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new KeysDownFSM(logger, handler), new KeysDataImpl(), logger, name ?? KeysDown.name);
    }
}
