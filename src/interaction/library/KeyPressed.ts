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

import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { TerminalState } from "../../fsm/TerminalState";
import { KeyPressureTransition } from "../../fsm/KeyPressureTransition";
import { OutputState } from "../../fsm/OutputState";
import { InputState } from "../../fsm/InputState";
import { KeyData } from "./KeyData";
import { KeyInteraction } from "./KeyInteraction";
import { FSM } from "../../fsm/FSM";

export class KeyPressedFSM extends FSM {
    private readonly modifiersAccepted: boolean;

    public constructor(modifierAccepted: boolean) {
        super();
        this.modifiersAccepted = modifierAccepted;
    }

    public buildFSM(dataHandler?: KeyPressedFSMHandler) {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");

        this.addState(pressed);

        new class extends KeyPressureTransition {
            private readonly _parent: KeyPressedFSM;

            public constructor(parent: KeyPressedFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof KeyboardEvent && dataHandler !== undefined) {
                    dataHandler.onKeyPressed(event);
                }
            }

            public isGuardOK(event: Event): boolean {
                return this._parent.modifiersAccepted || (event instanceof KeyboardEvent && !event.altKey && !event.ctrlKey
                    && !event.shiftKey && !event.metaKey);
            }

        }(this, this.initState, pressed);
    }

    public reinit(): void {
        super.reinit();
    }

}

export interface KeyPressedFSMHandler extends FSMDataHandler {
    onKeyPressed(event: Event): void;
}

/**
 * A user interaction for pressing a key on a keyboard
 * @author Gwendal DIDOT
 */

export class KeyPressed extends KeyInteraction<KeyData, KeyPressedFSM, Node> {

    private readonly handler: KeyPressedFSMHandler;

    public constructor(modifierAccepted: boolean, fsm?: KeyPressedFSM) {
        super(fsm === undefined ? new KeyPressedFSM(modifierAccepted) : fsm);

        this.handler = new class implements KeyPressedFSMHandler {
            private readonly _parent: KeyPressed;

            public constructor(parent: KeyPressed) {
                this._parent = parent;
            }

            public onKeyPressed(event: KeyboardEvent): void {
                this._parent.setKeyData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);

    }

    public getData(): KeyData {
        return this;
    }
}
