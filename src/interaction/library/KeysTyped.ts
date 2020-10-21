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
import {FSM} from "../../fsm/FSM";
import {InteractionImpl} from "../InteractionImpl";
import {KeyTypedFSM} from "./KeyTyped";
import {SubFSMTransition} from "../../fsm/SubFSMTransition";
import {TimeoutTransition} from "../../fsm/TimeoutTransition";
import {KeysData} from "./KeysData";
import {KeysDataImpl} from "./KeysDataImpl";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";

/**
 * An FSM for typing several keyboard touches.
 * One can type on multiple keys. The FSM ends after a timeout (a delay after the latest
 * typed key).
 */
export class KeysTypedFSM extends FSM {
    private readonly keyTypeFSM: KeyTypedFSM;

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
        this.keyTypeFSM = new KeyTypedFSM();
    }

    public buildFSM(dataHandler?: KeyTypedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        this.keyTypeFSM.buildFSM(dataHandler);
        super.buildFSM(dataHandler);

        const typed: StdState = new StdState(this, "typed");
        const timeouted: TerminalState = new TerminalState(this, "timeouted");

        this.addState(typed);
        this.addState(timeouted);

        new SubFSMTransition(this.initState, typed, this.keyTypeFSM);
        new SubFSMTransition(typed, typed, this.keyTypeFSM);
        new TimeoutTransition(typed, timeouted, KeysTypedFSM.timeGapSupplier);
    }


    public log(log: boolean): void {
        super.log(log);
        this.keyTypeFSM.log(log);
    }

    public reinit(): void {
        super.reinit();
        this.keyTypeFSM.reinit();
    }

    public fullReinit(): void {
        super.fullReinit();
        this.keyTypeFSM.fullReinit();
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
export class KeysTyped extends InteractionImpl<KeysData, KeysTypedFSM> {
    private readonly handler: KeyTypedFSMHandler;

    /**
     * Creates the user interaction.
     */
    public constructor() {
        super(new KeysTypedFSM());

        this.handler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                (this.data as (KeysDataImpl)).setKeysDataTarget(event);
                (this.data as (KeysDataImpl)).addKeysDataKey(event);
            },
            "reinitData": (): void => this.reinitData()
        };

        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): KeysData {
        return new KeysDataImpl();
    }
}
