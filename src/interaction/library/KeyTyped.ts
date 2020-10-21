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

import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import {KeyPressureTransition} from "../../fsm/KeyPressureTransition";
import {KeyData} from "./KeyData";
import {StdState} from "../../fsm/StdState";
import {KeyReleaseTransition} from "../../fsm/KeyReleaseTransition";
import {FSM} from "../../fsm/FSM";
import {KeyDataImpl} from "./KeyDataImpl";
import {InteractionImpl} from "../InteractionImpl";

/**
 * The FSM that describes a keyboard touch typed.
 */
export class KeyTypedFSM extends FSM {
    private checkKey?: string;

    public buildFSM(dataHandler?: KeyTypedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: StdState = new StdState(this, "pressed");
        const typed: TerminalState = new TerminalState(this, "typed");
        this.setStartingState(typed);

        this.addState(pressed);
        this.addState(typed);

        const kp = new KeyPressureTransition(this.initState, pressed);
        kp.action = (event: Event): void => {
            if (event instanceof KeyboardEvent) {
                this.checkKey = event.code;
            }
        };

        const kr = new KeyReleaseTransition(pressed, typed);
        kr.isGuardOK = (event: Event): boolean => this.checkKey === undefined ||
                    (event instanceof KeyboardEvent && event.code === this.checkKey);
        kr.action = (event: Event): void => {
            if (dataHandler !== undefined && event instanceof KeyboardEvent) {
                dataHandler.onKeyTyped(event);
            }
        };
    }

    public reinit(): void {
        super.reinit();
        this.checkKey = undefined;
    }
}

interface KeyTypedFSMHandler extends FSMDataHandler {
    onKeyTyped(event: Event): void;
}

/**
 * A user interaction for pressing and releasing a keyboard key
 * @author Gwendal DIDOT
 */
export class KeyTyped extends InteractionImpl<KeyData, KeyTypedFSM> {
    private readonly handler: KeyTypedFSMHandler;

    /**
     * Creates the user interaction.
     */
    public constructor() {
        super(new KeyTypedFSM());

        this.handler = {
            "onKeyTyped": (event: KeyboardEvent): void => {
                (this.getData() as KeyDataImpl).setKeyData(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): KeyData {
        return new KeyDataImpl();
    }
}
