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
import {StdState} from "../../fsm/StdState";
import {KeyUpTransition} from "../../fsm/KeyUpTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {KeyDataImpl} from "../KeyDataImpl";
import {InteractionBase} from "../InteractionBase";

/**
 * The FSM that describes a keyboard touch typed.
 */
export class KeyTypedFSM extends FSMImpl<KeyTypedFSMHandler> {
    private checkKey?: string;

    public constructor(dataHandler: KeyTypedFSMHandler) {
        super(dataHandler);

        const pressed: StdState = new StdState(this, "pressed");
        const typed: TerminalState = new TerminalState(this, "typed");
        this.startingState = typed;

        this.addState(pressed);
        this.addState(typed);

        const kp = new KeyDownTransition(this.initState, pressed);
        kp.action = (event: KeyboardEvent): void => {
            this.checkKey = event.code;
        };

        const kr = new KeyUpTransition(pressed, typed);
        kr.isGuardOK = (event: KeyboardEvent): boolean => this.checkKey === undefined || event.code === this.checkKey;
        kr.action = (event: KeyboardEvent): void => {
            this.dataHandler?.onKeyTyped(event);
        };
    }

    public override reinit(): void {
        super.reinit();
        this.checkKey = undefined;
    }
}

interface KeyTypedFSMHandler extends FSMDataHandler {
    onKeyTyped(event: KeyboardEvent): void;
}

/**
 * A user interaction for pressing, then releasing a keyboard key
 */
export class KeyTyped extends InteractionBase<KeyData, KeyDataImpl, KeyTypedFSM> {
    /**
     * Creates the user interaction.
     */
    public constructor() {
        const handler: KeyTypedFSMHandler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new KeyTypedFSM(handler), new KeyDataImpl());
    }
}
