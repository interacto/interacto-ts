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

/**
 * This interaction permits to define combo a key pressed that can be used to define shortcuts, etc.
 * @category FSM
 */
export class KeysDownFSM extends FSMImpl {
    private readonly currentCodes: Array<string>;

    /**
     * Creates the FSM.
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on keys down
     */
    public constructor(logger: Logger, action: (evt: KeyboardEvent) => void) {
        super(logger);
        this.currentCodes = [];

        const pressed = this.addStdState("pressed");

        const actionkp = (evt: KeyboardEvent): void => {
            this.currentCodes.push(evt.code);
            action(evt);
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
        const action = (event: KeyboardEvent): void => {
            this._data.addKey(event);
        };
        super(new KeysDownFSM(logger, action), new KeysDataImpl(), logger, name ?? KeysDown.name);
    }
}
