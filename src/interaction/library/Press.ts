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
import { PressureTransition } from "../../fsm/PressureTransition";
import { isMouseDownEvent } from "../../fsm/Events";
import { PointInteraction } from "./PointInteraction";
import { PointData } from "./PointData";
import { FSM } from "../../fsm/FSM";

export class PressFSM extends FSM {
    private checkButton: number | undefined;

    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: PressFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");
        this.addState(pressed);

        new class extends PressureTransition {
            public action(event: Event): void {
                if (event.target !== null && isMouseDownEvent(event) && dataHandler !== undefined) {
                    dataHandler.initToPress(event);
                }
            }
        }(this.initState, pressed);
    }

    public setCheckButton(buttonToCheck: number): void {
        if (this.checkButton === undefined) {
            this.checkButton = buttonToCheck;
        }
    }

    public getCheckButton(): number {
        return this.checkButton === undefined ? -1 : this.checkButton;
    }
}

interface PressFSMHandler extends FSMDataHandler {
    initToPress(event: Event): void;
}

/**
 * A user interaction for pressing down the mouse button.
 * @author Gwendal DIDOT
 */
export class Press extends PointInteraction<PointData, PressFSM, Node> {
    /**
     * Creates the interaction.
     */
    private readonly handler: PressFSMHandler;

    public constructor(fsm?: PressFSM) {
        super(fsm === undefined ? new PressFSM() : fsm);

        this.handler = new class implements PressFSMHandler {
            private readonly _parent: Press;

            constructor(parent: Press) {
                this._parent = parent;
            }

            public initToPress(event: MouseEvent): void {
                this._parent.setPointData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public getData(): PointData {
        return this;
    }
}
