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

import { InteractionImpl } from "../InteractionImpl";
import { TouchData, TouchDataImpl } from "./TouchData";
import { FSM } from "../../fsm/FSM";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { StdState } from "../../fsm/StdState";
import { TerminalState } from "../../fsm/TerminalState";
import { TouchPressureTransition } from "../../fsm/TouchPressureTransition";
import { OutputState } from "../../fsm/OutputState";
import { InputState } from "../../fsm/InputState";
import { TouchMoveTransition } from "../../fsm/TouchMoveTransition";
import { TouchReleaseTransition } from "../../fsm/TouchReleaseTransition";
import { getTouch } from "../../fsm/Events";

/**
 * The FSM that defines a touch interaction (that works like a DnD)
 */
export class TouchDnDFSM extends FSM {
    private touchID: number | undefined;

    /**
	 * Creates the FSM.
	 */
    public constructor() {
        super();
        this.touchID = undefined;
    }

    public buildFSM(dataHandler?: TouchDnDFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const touched = new StdState(this, "touched");
        const released = new TerminalState(this, "released");

        this.addState(touched);
        this.addState(released);

        new class extends TouchPressureTransition {
            private readonly _parent: TouchDnDFSM;

            public constructor(parent: TouchDnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof TouchEvent) {
                    this._parent.touchID = event.changedTouches[0].identifier;
                    if (dataHandler !== undefined) {
                        dataHandler.onTouch(event);
                    }
                }
            }
        }(this, this.initState, touched);

        new class extends TouchMoveTransition {
            private readonly _parent: TouchDnDFSM;

            public constructor(parent: TouchDnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof TouchEvent && event.changedTouches[0].identifier === this._parent.touchID;
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof TouchEvent) {
                    dataHandler.onMove(event);
                }
            }
        }(this, touched, touched);

        new class extends TouchReleaseTransition {
            private readonly _parent: TouchDnDFSM;

            public constructor(parent: TouchDnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof TouchEvent && event.changedTouches[0].identifier === this._parent.touchID;
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof TouchEvent) {
                    dataHandler.onRelease(event);
                }
            }
        }(this, touched, released);

        super.buildFSM(dataHandler);
    }

    public getTouchId(): number | undefined {
        return this.touchID;
    }

    public reinit(): void {
        super.reinit();
        this.touchID = undefined;
    }
}

export interface TouchDnDFSMHandler extends FSMDataHandler {
    onTouch(event: TouchEvent): void;

    onMove(event: TouchEvent): void;

    onRelease(event: TouchEvent): void;
}

/**
 * A touch interaction (that works as a DnD)
 */
export class TouchDnD extends InteractionImpl<TouchData, TouchDnDFSM> {
    private readonly handler: TouchDnDFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(fsm?: TouchDnDFSM) {
        super(fsm ?? new TouchDnDFSM());

        this.handler = new class implements TouchDnDFSMHandler {
            private readonly _parent: TouchDnD;

            public constructor(parent: TouchDnD) {
                this._parent = parent;
            }

            public onTouch(evt: TouchEvent): void {
                const touch: Touch = evt.changedTouches[0];
                (this._parent.data as (TouchDataImpl)).setPointData(touch.clientX, touch.clientY, touch.screenX, touch.screenY,
                    undefined, touch.target, touch.target);
                (this._parent.data as (TouchDataImpl)).setTouchId(touch.identifier);
                this.setTgtData(evt);
            }

            public onMove(evt: TouchEvent): void {
                this.setTgtData(evt);
            }

            public onRelease(evt: TouchEvent): void {
                this.setTgtData(evt);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }

            private setTgtData(evt: TouchEvent): void {
                const data = this._parent.data as (TouchDataImpl);
                const touch: Touch | undefined = getTouch(evt.changedTouches, data.getTouchId());
                if(touch !== undefined) {
                    data.setTgtData(touch.clientX, touch.clientY, touch.screenX, touch.screenY, touch.target);
                }
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): TouchData {
        return new TouchDataImpl();
    }
}
