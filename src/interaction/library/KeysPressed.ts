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

import { InputState } from "../../fsm/InputState";
import { OutputState } from "../../fsm/OutputState";
import { StdState } from "../../fsm/StdState";
import { TerminalState } from "../../fsm/TerminalState";
import { KeyPressureTransition } from "../../fsm/KeyPressureTransition";
import { KeyReleaseTransition } from "../../fsm/KeyReleaseTransition";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { MultiKeyInteraction } from "./MultiKeyInteraction";
import { KeysData } from "./KeysData";
import { FSM } from "../../fsm/FSM";

export class KeysPressedFSM extends FSM {
    private readonly currentCodes: Array<string>;

    public constructor() {
        super();
        this.currentCodes = [];
    }

    public buildFSM(dataHandler?: KeysPressedFSMHandler) {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: StdState = new StdState(this, "pressed");
        const ended: TerminalState = new TerminalState(this, "ended");
        this.addState(pressed);
        this.addState(ended);

        new class extends KeyPressureTransition {
            private readonly _parent: KeysPressedFSM;

            public constructor(parent: KeysPressedFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof KeyboardEvent) {
                    this._parent.currentCodes.push(event.code);
                    if (dataHandler !== undefined) {
                        dataHandler.onKeyPressed(event);
                    }
                }
            }

        }(this, this.initState, pressed);
        new class extends KeyPressureTransition {
            private readonly _parent: KeysPressedFSM;

            public constructor(parent: KeysPressedFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof KeyboardEvent) {
                    this._parent.currentCodes.push(event.code);
                    if (dataHandler !== undefined) {
                        dataHandler.onKeyPressed(event);
                    }
                }
            }

        }(this, pressed, pressed);

        new class extends KeyReleaseTransition {
            private readonly _parent: KeysPressedFSM;

            public constructor(parent: KeysPressedFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event) {
                return event instanceof KeyboardEvent && (this._parent.currentCodes.find(value => value === event.code) !== undefined);
            }
        }(this, pressed, ended);
    }

    public reinit(): void {
        this.currentCodes.splice(0, this.currentCodes.length);
    }
}

export interface KeysPressedFSMHandler extends FSMDataHandler {
    onKeyPressed(event: KeyboardEvent): void;
}

export class KeysPressed extends MultiKeyInteraction<KeysData, KeysPressedFSM> {
    private readonly handler: KeysPressedFSMHandler;

    public constructor(fsm?: KeysPressedFSM) {
        super(fsm === undefined ? new KeysPressedFSM() : fsm);

        this.handler = new class implements KeysPressedFSMHandler {
            private readonly _parent: KeysPressed;

            public constructor(parent: KeysPressed) {
                this._parent = parent;
            }

            public onKeyPressed(event: KeyboardEvent) {
                this._parent.setKeysDataTartget(event);
                this._parent.addKeysDataKey(event);
            }

            public reinitData() {
                this._parent.reinitData();
            }
        }(this);

        this.getFsm().buildFSM(this.handler);
    }

    public getData(): KeysData {
        return this;
    }
}
