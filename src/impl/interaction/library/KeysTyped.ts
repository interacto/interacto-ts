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
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {InteractionBase} from "../InteractionBase";
import {KeysDataImpl} from "../KeysDataImpl";
import type {KeysData} from "../../../api/interaction/KeysData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * An FSM for typing several keyboard touches.
 * One can type on multiple keys. The FSM ends after a timeout (a delay after the latest
 * typed key).
 * @category FSM
 */
export class KeysTypedFSM extends FSMImpl {
    /** The time gap between the two spinner events. */
    private static readonly timeGap: number = 1000;

    /**
     * The supplier that provides the time gap.
     * @returns The time gap.
     */
    private static readonly timeGapSupplier: () => number = () => KeysTypedFSM.getTimeGap();

    private static getTimeGap(): number {
        return KeysTypedFSM.timeGap;
    }

    /**
     * Creates the FSM.
     * @param logger - The logger to use for this interaction
     * @param action - The action executed on a key typed
     */
    public constructor(logger: Logger, action: (event: KeyboardEvent) => void) {
        super(logger);
        const keyup = this.addStdState("keyup");
        new KeyTransition(this.initState, keyup, "keyup", action);
        new KeyTransition(keyup, keyup, "keyup", action);
        new TimeoutTransition(keyup, this.addTerminalState("timeouted"), KeysTypedFSM.timeGapSupplier);
    }
}

/**
 * A user interaction for typing several keyboard keys.
 * One can type on multiple keys. The interaction ends after a timeout (a delay after the latest
 * typed key).
 * @category Interaction Library
 */
export class KeysTyped extends InteractionBase<KeysData, KeysDataImpl> {
    /**
     * Creates the user interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const action = (event: KeyboardEvent): void => {
            this._data.addKey(event);
        };
        super(new KeysTypedFSM(logger, action), new KeysDataImpl(), logger, name ?? KeysTyped.name);
    }
}
