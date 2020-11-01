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

import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {KeyPressureTransition} from "../../fsm/KeyPressureTransition";
import {KeyReleaseTransition} from "../../fsm/KeyReleaseTransition";
import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {KeysData} from "../../../api/interaction/KeysData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {KeysDataImpl} from "./KeysDataImpl";
import {InteractionBase} from "../InteractionBase";

/**
 * This interaction permits to define combo a key pressed that can be used to define shortcuts, etc.
 * @author Arnaud BLOUIN
 */
export class KeysPressedFSM extends FSMImpl {
    private readonly currentCodes: Array<string>;

    /**
     * Creates the FSM.
     */
    public constructor() {
        super();
        this.currentCodes = [];
    }

    public buildFSM(dataHandler?: KeysPressedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: StdState = new StdState(this, "pressed");
        const ended: TerminalState = new TerminalState(this, "ended");
        this.addState(pressed);
        this.addState(ended);

        const actionkp = (event: KeyboardEvent): void => {
            this.currentCodes.push(event.code);
            dataHandler?.onKeyPressed(event);
        };
        const kpInit = new KeyPressureTransition(this.initState, pressed);
        kpInit.action = actionkp;

        const kpPressed = new KeyPressureTransition(pressed, pressed);
        kpPressed.action = actionkp;

        const kr = new KeyReleaseTransition(pressed, ended);
        kr.isGuardOK = (event: KeyboardEvent): boolean => this.currentCodes.find(value => value === event.code) !== undefined;
    }

    public reinit(): void {
        this.currentCodes.length = 0;
        super.reinit();
    }
}

interface KeysPressedFSMHandler extends FSMDataHandler {
    onKeyPressed(event: KeyboardEvent): void;
}

/**
 * Several keys pressed at the same time.
 * Starts on a key pressure. Ends as soon as one of the pressed keys is released.
 */
export class KeysPressed extends InteractionBase<KeysData, KeysPressedFSM> {
    private readonly handler: KeysPressedFSMHandler;

    /**
     * Creates the user interaction.
     */
    public constructor() {
        super(new KeysPressedFSM());

        this.handler = {
            "onKeyPressed": (event: KeyboardEvent): void => {
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
