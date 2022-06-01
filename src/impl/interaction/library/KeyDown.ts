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
import type {Logger} from "../../../api/logging/Logger";
import {KeyTransition} from "../../fsm/KeyTransition";

/**
 * An FSM for a single key pressure.
 */
export class KeyDownFSM extends FSMImpl<KeyDownFSMHandler> {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     */
    public constructor(modifierAccepted: boolean, logger: Logger, dataHandler: KeyDownFSMHandler) {
        super(logger, dataHandler);
        this.modifiersAccepted = modifierAccepted;

        new KeyTransition(this.initState, this.addTerminalState("pressed"), "keydown",
            (evt: KeyboardEvent): void => {
                this.dataHandler?.onKeyPressed(evt);
            },
            (evt: KeyboardEvent): boolean => this.modifiersAccepted || (!evt.altKey && !evt.ctrlKey && !evt.shiftKey && !evt.metaKey));
    }

    public override reinit(): void {
        super.reinit();
    }

}

interface KeyDownFSMHandler extends FSMDataHandler {
    onKeyPressed(event: KeyboardEvent): void;
}

/**
 * A user interaction for pressing a key on a keyboard
 */
export class KeyDown extends InteractionBase<KeyData, KeyDataImpl, KeyDownFSM> {

    public constructor(logger: Logger, modifierAccepted: boolean, fsm?: KeyDownFSM) {
        const handler: KeyDownFSMHandler = {
            "onKeyPressed": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new KeyDownFSM(modifierAccepted, logger, handler), new KeyDataImpl(), logger);
    }
}
