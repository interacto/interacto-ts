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

/**
 * An FSM for a single key pressure.
 * @category FSM
 */
export class KeyDownFSM extends FSMImpl {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a key down
     * @param key - The optional accepted key code
     */
    public constructor(modifierAccepted: boolean, logger: Logger, action: (evt: KeyboardEvent) => void, key?: string) {
        super(logger);
        this.modifiersAccepted = modifierAccepted;

        new KeyTransition(this.initState, this.addTerminalState("pressed"), "keydown", action,
            (evt: KeyboardEvent): boolean => (key === undefined || key === evt.code) &&
                (this.modifiersAccepted || (!evt.altKey && !evt.ctrlKey && !evt.shiftKey && !evt.metaKey)));
    }
}

/**
 * A user interaction for pressing a key on a keyboard
 * @category Interaction Library
 */
export class KeyDown extends InteractionBase<KeyData, KeyDataImpl> {
    public constructor(logger: Logger, modifierAccepted: boolean, key?: string, fsm?: KeyDownFSM, name?: string) {
        const action = (event: KeyboardEvent): void => {
            this._data.copy(event);
        };
        super(fsm ?? new KeyDownFSM(modifierAccepted, logger, action, key), new KeyDataImpl(), logger, name ?? KeyDown.name);
    }
}
