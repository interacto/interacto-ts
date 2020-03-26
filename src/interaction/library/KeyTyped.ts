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
import { KeyData } from "./KeyData";
import { StdState } from "../../fsm/StdState";
import { KeyReleaseTransition } from "../../fsm/KeyReleaseTransition";
import { CancellingState } from "../../fsm/CancellingState";
import { TimeoutTransition } from "../../fsm/TimeoutTransition";
import { OutputState } from "../../fsm/OutputState";
import { InputState } from "../../fsm/InputState";
import { FSM } from "../../fsm/FSM";
import { KeyDataImpl } from "./KeyDataImpl";
import { InteractionImpl } from "../InteractionImpl";

export class KeyTypedFSM extends FSM {
    private checkKey?: string;

    /** The time gap between the two spinner events. */
    private static readonly timeGap = 1000;
    /** The supplier that provides the time gap. */
    private static readonly SUPPLY_TIME_GAP: () => number = () => KeyTypedFSM.getTimeGap();

    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: KeyTypedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const pressed: StdState = new StdState(this, "pressed");
        const typed: TerminalState = new TerminalState(this, "typed");
        const cancel: CancellingState = new CancellingState(this, "cancel");

        this.addState(pressed);
        this.addState(typed);
        this.addState(cancel);

        new class extends KeyPressureTransition {
            private readonly _parent: KeyTypedFSM;

            public constructor(parent: KeyTypedFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof KeyboardEvent) {
                    this._parent.setCheckKey(event.code);
                }
            }

        }(this, this.initState, pressed);

        new class extends KeyReleaseTransition {
            private readonly _parent: KeyTypedFSM;

            public constructor(parent: KeyTypedFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return super.isGuardOK(event) && this._parent.checkKey === undefined ||
                    (event instanceof KeyboardEvent && event.code === this._parent.checkKey);
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof KeyboardEvent) {
                    dataHandler.onKeyTyped(event);
                }
            }
        }(this, pressed, typed);
        new TimeoutTransition(pressed, cancel, KeyTypedFSM.SUPPLY_TIME_GAP);
    }

    public getCheckKey(): string {
        return this.checkKey ?? "";
    }

    public setCheckKey(keyToCheck: string): void {
        if (this.checkKey === undefined) {
            this.checkKey = keyToCheck;
        }
    }

    public reinit(): void {
        super.reinit();
    }

    private static getTimeGap(): number {
        return KeyTypedFSM.timeGap;
    }
}

interface KeyTypedFSMHandler extends FSMDataHandler {
    onKeyTyped(event: Event): void;
}

/**
 * A user interaction for pressing and releasing a key on a keyboard
 * @author Gwendal DIDOT
 */

export class KeyTyped extends InteractionImpl<KeyData, KeyTypedFSM> {

    private readonly handler: KeyTypedFSMHandler;

    public constructor(fsm?: KeyTypedFSM) {
        super(fsm ?? new KeyTypedFSM());

        this.handler = new class implements KeyTypedFSMHandler {
            private readonly _parent: KeyTyped;

            public constructor(parent: KeyTyped) {
                this._parent = parent;
            }

            public onKeyTyped(event: KeyboardEvent): void {
                (this._parent.getData() as KeyDataImpl).setKeyData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);

    }

    public createDataObject(): KeyData {
        return new KeyDataImpl();
    }
}
