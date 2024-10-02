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

interface KeyDownFSMHandler extends FSMDataHandler {
    onKeyPressed(event: KeyboardEvent): void;
}

/**
 * An FSM for a single key pressure.
 * @category FSM
 */
export class KeyDownFSM extends FSMImpl<KeyDownFSMHandler> {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     * @param key - The optional accpeted key code
     */
    public constructor(modifierAccepted: boolean, logger: Logger, dataHandler: KeyDownFSMHandler, key?: string) {
        super(logger, dataHandler);
        this.modifiersAccepted = modifierAccepted;

        new KeyTransition(this.initState, this.addTerminalState("pressed"), "keydown",
            (evt: KeyboardEvent): void => {
                this.dataHandler?.onKeyPressed(evt);
            },
            (evt: KeyboardEvent): boolean => (key === undefined || key === evt.code) &&
                (this.modifiersAccepted || (!evt.altKey && !evt.ctrlKey && !evt.shiftKey && !evt.metaKey)));
    }

    public override reinit(): void {
        super.reinit();
    }

}

/**
 * A user interaction for pressing a key on a keyboard
 * @category Interaction Library
 */
export class KeyDown extends InteractionBase<KeyData, KeyDataImpl> {

    public constructor(logger: Logger, modifierAccepted: boolean, key?: string, fsm?: KeyDownFSM, name?: string) {
        const handler: KeyDownFSMHandler = {
            "onKeyPressed": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new KeyDownFSM(modifierAccepted, logger, handler, key), new KeyDataImpl(), logger, name ?? KeyDown.name);
    }
}
