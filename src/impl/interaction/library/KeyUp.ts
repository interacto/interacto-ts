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
import type {KeyData} from "../../../api/interaction/KeyData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {KeyDataImpl} from "../KeyDataImpl";
import {KeyUpTransition} from "../../fsm/KeyUpTransition";
import type {Logger} from "../../../api/logging/Logger";

/**
 * An FSM for a single key release.
 */
export class KeyUpFSM extends FSMImpl<KeyUpFSMHandler> {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     */
    public constructor(modifierAccepted: boolean, logger: Logger, dataHandler: KeyUpFSMHandler) {
        super(logger, dataHandler);
        this.modifiersAccepted = modifierAccepted;

        new KeyUpTransition(this.initState, this.addTerminalState("released"),
            (evt: KeyboardEvent): void => {
                this.dataHandler?.onKeyUp(evt);
            },
            (ev: KeyboardEvent): boolean => this.modifiersAccepted || (!ev.altKey && !ev.ctrlKey && !ev.shiftKey && !ev.metaKey));
    }
}

interface KeyUpFSMHandler extends FSMDataHandler {
    onKeyUp(event: KeyboardEvent): void;
}

/**
 * A user interaction for releasing a key on a keyboard
 */
export class KeyUp extends InteractionBase<KeyData, KeyDataImpl, KeyUpFSM> {
    public constructor(logger: Logger, modifierAccepted: boolean, fsm?: KeyUpFSM) {
        const handler: KeyUpFSMHandler = {
            "onKeyUp": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new KeyUpFSM(modifierAccepted, logger, handler), new KeyDataImpl(), logger);
    }
}
