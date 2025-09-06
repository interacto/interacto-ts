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
 * The FSM that describes a keyboard touch typed.
 * @category FSM
 */
export class KeyTypedFSM extends FSMImpl {
    private checkKey: string | undefined;

    public constructor(logger: Logger, action: (event: KeyboardEvent) => void, key?: string) {
        super(logger);

        this.checkKey = key;
        const pressed = this.addStdState("pressed");

        new KeyTransition(this.initState, pressed, "keydown",
            (event: KeyboardEvent): void => {
                this.checkKey ??= event.code;
            });

        new KeyTransition(pressed, this.addTerminalState("typed", true), "keyup", action,
            (evt: KeyboardEvent): boolean => this.checkKey === undefined || evt.code === this.checkKey);
    }

    public override reinit(): void {
        super.reinit();
        this.checkKey = undefined;
    }
}

/**
 * A user interaction for pressing, then releasing a keyboard key
 * @category Interaction Library
 */
export class KeyTyped extends InteractionBase<KeyData, KeyDataImpl> {
    /**
     * Creates the user interaction.
     * @param logger - The logger to use for this interaction
     * @param key - The expected key. Do nothing if the involved key is different
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, key?: string, name?: string) {
        const action = (event: KeyboardEvent): void => {
            this._data.copy(event);
        };
        super(new KeyTypedFSM(logger, action, key), new KeyDataImpl(), logger, name ?? KeyTyped.name);
    }
}
