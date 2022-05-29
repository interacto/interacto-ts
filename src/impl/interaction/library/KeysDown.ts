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

import {KeyDownTransition} from "../../fsm/KeyDownTransition";
import {KeyUpTransition} from "../../fsm/KeyUpTransition";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {KeysData} from "../../../api/interaction/KeysData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {KeysDataImpl} from "../KeysDataImpl";
import {InteractionBase} from "../InteractionBase";

/**
 * This interaction permits to define combo a key pressed that can be used to define shortcuts, etc.
 */
export class KeysDownFSM extends FSMImpl<KeysDownFSMHandler> {
    private readonly currentCodes: Array<string>;

    /**
     * Creates the FSM.
     */
    public constructor(dataHandler: KeysDownFSMHandler) {
        super(dataHandler);
        this.currentCodes = [];

        const pressed = this.addStdState("pressed");

        const actionkp = (evt: KeyboardEvent): void => {
            this.currentCodes.push(evt.code);
            this.dataHandler?.onKeyPressed(evt);
        };
        new KeyDownTransition(this.initState, pressed, actionkp);

        new KeyDownTransition(pressed, pressed, actionkp);

        new KeyUpTransition(pressed, this.addTerminalState("ended"), undefined,
            (evt: KeyboardEvent): boolean => this.currentCodes.find(value => value === evt.code) !== undefined);
    }

    public override reinit(): void {
        this.currentCodes.length = 0;
        super.reinit();
    }
}

interface KeysDownFSMHandler extends FSMDataHandler {
    onKeyPressed(event: KeyboardEvent): void;
}

/**
 * Several keys pressed at the same time.
 * Starts on a key pressure. Ends as soon as one of the pressed keys is released.
 */
export class KeysDown extends InteractionBase<KeysData, KeysDataImpl, KeysDownFSM> {
    /**
     * Creates the user interaction.
     */
    public constructor() {
        const handler: KeysDownFSMHandler = {
            "onKeyPressed": (event: KeyboardEvent): void => {
                this._data.addKey(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new KeysDownFSM(handler), new KeysDataImpl());
    }
}
