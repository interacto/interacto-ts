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
import {KeyDataImpl} from "../KeyDataImpl";
import {InteractionBase} from "../InteractionBase";
import type {Logger} from "../../../api/logging/Logger";
import {KeyTransition} from "../../fsm/KeyTransition";

/**
 * The FSM that describes a keyboard touch typed.
 */
export class KeyTypedFSM extends FSMImpl<KeyTypedFSMHandler> {
    private checkKey: string | undefined;

    public constructor(logger: Logger, dataHandler: KeyTypedFSMHandler) {
        super(logger, dataHandler);

        const pressed = this.addStdState("pressed");

        new KeyTransition(this.initState, pressed, "keydown",
            (event: KeyboardEvent): void => {
                this.checkKey = event.code;
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
    public constructor(logger: Logger, name?: string) {
        const handler: KeyTypedFSMHandler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new KeyTypedFSM(logger, handler), new KeyDataImpl(), logger, name ?? KeyTyped.name);
    }
}
