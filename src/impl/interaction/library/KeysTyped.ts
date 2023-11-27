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
import {InteractionBase} from "../InteractionBase";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import type {KeysData} from "../../../api/interaction/KeysData";
import {KeysDataImpl} from "../KeysDataImpl";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import type {Logger} from "../../../api/logging/Logger";
import {KeyTransition} from "../../fsm/KeyTransition";

/**
 * An FSM for typing several keyboard touches.
 * One can type on multiple keys. The FSM ends after a timeout (a delay after the latest
 * typed key).
 */
export class KeysTypedFSM extends FSMImpl<KeyTypedFSMHandler> {
    /** The time gap between the two spinner events. */
    private static readonly timeGap: number = 1000;

    /** The supplier that provides the time gap. */
    private static readonly timeGapSupplier: () => number = () => KeysTypedFSM.getTimeGap();

    private static getTimeGap(): number {
        return KeysTypedFSM.timeGap;
    }

    /**
     * Creates the FSM.
     */
    public constructor(logger: Logger, dataHandler: KeyTypedFSMHandler) {
        super(logger, dataHandler);

        const keyup = this.addStdState("keyup");

        const action = (event: KeyboardEvent): void => {
            this.dataHandler?.onKeyTyped(event);
        };

        new KeyTransition(this.initState, keyup, "keyup", action);

        new KeyTransition(keyup, keyup, "keyup", action);

        new TimeoutTransition(keyup, this.addTerminalState("timeouted"), KeysTypedFSM.timeGapSupplier);
    }
}

interface KeyTypedFSMHandler extends FSMDataHandler {
    onKeyTyped(event: Event): void;
}

/**
 * A user interaction for typing several keyboard keys.
 * One can type on multiple keys. The interaction ends after a timeout (a delay after the latest
 * typed key).
 */
export class KeysTyped extends InteractionBase<KeysData, KeysDataImpl, KeysTypedFSM> {
    /**
     * Creates the user interaction.
     */
    public constructor(logger: Logger, name?: string) {
        const handler: KeyTypedFSMHandler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                this._data.addKey(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new KeysTypedFSM(logger, handler), new KeysDataImpl(), logger, name ?? KeysTyped.name);
    }
}
