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

interface KeyTypedFSMHandler extends FSMDataHandler {
    onKeyTyped(event: KeyboardEvent): void;
}

/**
 * The FSM that describes a keyboard touch typed.
 */
export class KeyTypedFSM extends FSMImpl<KeyTypedFSMHandler> {
    private checkKey: string | undefined;

    public constructor(logger: Logger, dataHandler: KeyTypedFSMHandler, key?: string) {
        super(logger, dataHandler);

        this.checkKey = key;
        const pressed = this.addStdState("pressed");

        new KeyTransition(this.initState, pressed, "keydown",
            (event: KeyboardEvent): void => {
                if (this.checkKey === undefined) {
                    this.checkKey = event.code;
                }
            });

        new KeyTransition(pressed, this.addTerminalState("typed", true), "keyup",
            (evt: KeyboardEvent): void => {
                this.dataHandler?.onKeyTyped(evt);
            },
            (evt: KeyboardEvent): boolean => this.checkKey === undefined || evt.code === this.checkKey);
    }

    public override reinit(): void {
        super.reinit();
        this.checkKey = undefined;
    }
}

/**
 * A user interaction for pressing, then releasing a keyboard key
 */
export class KeyTyped extends InteractionBase<KeyData, KeyDataImpl, KeyTypedFSM> {
    /**
     * Creates the user interaction.
     * @param logger - The logger to use for this interaction
     * @param key - The expected key. Do nothing if the involved key is different
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, key?: string, name?: string) {
        const handler: KeyTypedFSMHandler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new KeyTypedFSM(logger, handler, key), new KeyDataImpl(), logger, name ?? KeyTyped.name);
    }
}
