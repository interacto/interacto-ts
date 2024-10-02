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
import {KeyDataImpl} from "../KeyDataImpl";
import type {KeyData} from "../../../api/interaction/KeyData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

interface KeyUpFSMHandler extends FSMDataHandler {
    onKeyUp(event: KeyboardEvent): void;
}

/**
 * An FSM for a single key release.
 * @category FSM
 */
export class KeyUpFSM extends FSMImpl<KeyUpFSMHandler> {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(modifierAccepted: boolean, logger: Logger, dataHandler: KeyUpFSMHandler) {
        super(logger, dataHandler);
        this.modifiersAccepted = modifierAccepted;

        new KeyTransition(this.initState, this.addTerminalState("released"), "keyup",
            (evt: KeyboardEvent): void => {
                this.dataHandler?.onKeyUp(evt);
            },
            (ev: KeyboardEvent): boolean => this.modifiersAccepted || (!ev.altKey && !ev.ctrlKey && !ev.shiftKey && !ev.metaKey));
    }
}

/**
 * A user interaction for releasing a key on a keyboard
 * @category Interaction Library
 */
export class KeyUp extends InteractionBase<KeyData, KeyDataImpl> {
    public constructor(logger: Logger, modifierAccepted: boolean, fsm?: KeyUpFSM, name?: string) {
        const handler: KeyUpFSMHandler = {
            "onKeyUp": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new KeyUpFSM(modifierAccepted, logger, handler), new KeyDataImpl(), logger, name ?? KeyUp.name);
    }
}
