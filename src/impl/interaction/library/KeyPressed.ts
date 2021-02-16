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

import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import {KeyPressureTransition} from "../../fsm/KeyPressureTransition";
import {KeyData} from "../../../api/interaction/KeyData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {KeyDataImpl} from "./KeyDataImpl";

/**
 * An FSM for a single key pressure.
 */
export class KeyPressedFSM extends FSMImpl {
    private readonly modifiersAccepted: boolean;

    /**
     * Creates the FSM.
     * @param modifierAccepted - True: the FSM will consider key modifiers.
     */
    public constructor(modifierAccepted: boolean) {
        super();
        this.modifiersAccepted = modifierAccepted;
    }

    public buildFSM(dataHandler?: KeyPressedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");

        this.addState(pressed);

        const kp = new KeyPressureTransition(this.initState, pressed);
        kp.action = (event: KeyboardEvent): void => {
            dataHandler?.onKeyPressed(event);
        };
        kp.isGuardOK = (event: KeyboardEvent): boolean => this.modifiersAccepted ||
            (!event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey);
    }

    public reinit(): void {
        super.reinit();
    }

}

interface KeyPressedFSMHandler extends FSMDataHandler {
    onKeyPressed(event: KeyboardEvent): void;
}

/**
 * A user interaction for pressing a key on a keyboard
 */
export class KeyPressed extends InteractionBase<KeyData, KeyDataImpl, KeyPressedFSM> {

    private readonly handler: KeyPressedFSMHandler;

    public constructor(modifierAccepted: boolean, fsm?: KeyPressedFSM) {
        super(fsm ?? new KeyPressedFSM(modifierAccepted));

        this.handler = {
            "onKeyPressed": (event: KeyboardEvent): void => {
                this.data.setKeyData(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): KeyDataImpl {
        return new KeyDataImpl();
    }
}
