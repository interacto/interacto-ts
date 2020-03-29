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
import { PointData } from "./PointData";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";
import { PointDataImpl } from "./PointDataImpl";

export class PressFSM extends FSM {
    private checkButton?: number;

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
        return this.checkButton ?? -1;
    }
}

interface PressFSMHandler extends FSMDataHandler {
    initToPress(event: Event): void;
}

/**
 * A user interaction for pressing down the mouse button.
 * @author Gwendal DIDOT
 */
export class Press extends InteractionImpl<PointData, PressFSM> {
    /**
     * Creates the interaction.
     */
    private readonly handler: PressFSMHandler;

    public constructor() {
        super(new PressFSM());

        this.handler = new class implements PressFSMHandler {
            private readonly _parent: Press;

            public constructor(parent: Press) {
                this._parent = parent;
            }

            public initToPress(evt: MouseEvent): void {
                (this._parent.data as PointDataImpl).setPointData(evt.clientX, evt.clientY, evt.screenX, evt.screenY,
                    evt.button, evt.target ?? undefined, evt.currentTarget ?? undefined);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): PointData {
        return new PointDataImpl();
    }
}
