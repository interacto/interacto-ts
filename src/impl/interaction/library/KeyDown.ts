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
import {TerminalState} from "../../fsm/TerminalState";
import {KeyDownTransition} from "../../fsm/KeyDownTransition";
import type {KeyData} from "../../../api/interaction/KeyData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {KeyDataImpl} from "../KeyDataImpl";

/**
 * An FSM for a single key pressure.
 */
export class KeyDownFSM extends FSMImpl {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     */
    public constructor(modifierAccepted: boolean) {
        super();
        this.modifiersAccepted = modifierAccepted;
    }

    public override buildFSM(dataHandler?: KeyDownFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");

        this.addState(pressed);

        const kp = new KeyDownTransition(this.initState, pressed);
        kp.action = (event: KeyboardEvent): void => {
            dataHandler?.onKeyPressed(event);
        };
        kp.isGuardOK = (event: KeyboardEvent): boolean => this.modifiersAccepted ||
            (!event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey);
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

    public constructor(modifierAccepted: boolean, fsm?: KeyDownFSM) {
        const handler: KeyDownFSMHandler = {
            "onKeyPressed": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new KeyDownFSM(modifierAccepted), new KeyDataImpl());

        this.fsm.buildFSM(handler);
    }
}
