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

import {TerminalState} from "../../fsm/TerminalState";
import {StdState} from "../../fsm/StdState";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import type {KeysData} from "../../../api/interaction/KeysData";
import {KeysDataImpl} from "../KeysDataImpl";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {KeyReleaseTransition} from "../../fsm/KeyReleaseTransition";
import type {Logger} from "../../../api/logging/Logger";

/**
 * An FSM for typing several keyboard touches.
 * One can type on multiple keys. The FSM ends after a timeout (a delay after the latest
 * typed key).
 */
export class KeysTypedFSM extends FSMImpl {
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
    public constructor() {
        super();
    }

    public override buildFSM(dataHandler?: KeyTypedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const keyup: StdState = new StdState(this, "keyup");
        const timeouted: TerminalState = new TerminalState(this, "timeouted");

        this.addState(keyup);
        this.addState(timeouted);

        const action = (event: KeyboardEvent): void => {
            dataHandler?.onKeyTyped(event);
        };
        const keyupInit = new KeyReleaseTransition(this.initState, keyup);
        const keyupSeq = new KeyReleaseTransition(keyup, keyup);
        keyupInit.action = action;
        keyupSeq.action = action;

        new TimeoutTransition(keyup, timeouted, KeysTypedFSM.timeGapSupplier);
    }
}

interface KeyTypedFSMHandler extends FSMDataHandler {
    onKeyTyped(event: Event): void;
}


/**
 * A user interaction for typing several keyboard touches.
 * One can type on multiple keys. The interaction ends after a timeout (a delay after the latest
 * typed key).
 */
export class KeysTyped extends InteractionBase<KeysData, KeysDataImpl, KeysTypedFSM> {
    /**
     * Creates the user interaction.
     */
    public constructor(logger?: Logger) {
        super(new KeysTypedFSM(), new KeysDataImpl(), logger);

        const handler: KeyTypedFSMHandler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                this._data.addKey(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(handler);
    }
}
