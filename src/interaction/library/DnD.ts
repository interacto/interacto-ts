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
import { StdState } from "../../../src/fsm/StdState";
import { TerminalState } from "../../../src/fsm/TerminalState";
import { CancellingState } from "../../../src/fsm/CancellingState";
import { OutputState } from "../../../src/fsm/OutputState";
import { InputState } from "../../../src/fsm/InputState";
import { MoveTransition } from "../../fsm/MoveTransition";
import { EscapeKeyPressureTransition } from "../../fsm/EscapeKeyPressureTransition";
import { SrcTgtPointsData, SrcTgtPointsDataImpl } from "./SrcTgtPointsData";
import { FSM } from "../../fsm/FSM";
import { PressureTransition } from "../../fsm/PressureTransition";
import { ReleaseTransition } from "../../fsm/ReleaseTransition";
import { InteractionImpl } from "../InteractionImpl";

/**
 * The FSM for DnD interactions.
 */
export class DnDFSM extends FSM {
    private readonly cancellable: boolean;
    private buttonToCheck?: number;

    /**
	 * Creates the FSM
	 * @param cancellable True: the FSM can be cancelled using the ESC key.
	 */
    public constructor(cancellable: boolean) {
        super();
        this.cancellable = cancellable;
    }

    public buildFSM(dataHandler?: DnDFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);

        const pressed: StdState = new StdState(this, "pressed");
        const dragged: StdState = new StdState(this, "dragged");
        const released: TerminalState = new TerminalState(this, "released");
        const cancelled: CancellingState = new CancellingState(this, "cancelled");

        this.addState(pressed);
        this.addState(dragged);
        this.addState(released);
        this.addState(cancelled);

        this.setStartingState(dragged);

        new class extends PressureTransition {
            private readonly _parent: DnDFSM;

            public constructor(parent: DnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {

                if (event instanceof MouseEvent) {
                    this._parent.buttonToCheck = event.button;
                    if (dataHandler !== undefined) {
                        dataHandler.onPress(event);
                    }
                }
            }

        }(this, this.initState, pressed);

        new class extends ReleaseTransition {
            private readonly _parent: DnDFSM;

            public constructor(parent: DnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }
        }(this, pressed, cancelled);

        new class extends MoveTransition {
            private readonly _parent: DnDFSM;

            public constructor(parent: DnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof MouseEvent) {
                    dataHandler.onDrag(event);
                }
            }
        }(this, pressed, dragged);

        new class extends MoveTransition {
            private readonly _parent: DnDFSM;

            public constructor(parent: DnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof MouseEvent) {
                    dataHandler.onDrag(event);
                }
            }
        }(this, dragged, dragged);

        new class extends ReleaseTransition {
            private readonly _parent: DnDFSM;

            public constructor(parent: DnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }

            public action(event: Event): void {
                if (dataHandler !== undefined && event instanceof MouseEvent) {
                    dataHandler.onRelease(event);
                }
            }
        }(this, dragged, released);

        if (this.cancellable) {
            new EscapeKeyPressureTransition(pressed, cancelled);
            new EscapeKeyPressureTransition(dragged, cancelled);
        }
    }

    public reinit(): void {
        super.reinit();
        this.buttonToCheck = undefined;
    }
}

interface DnDFSMHandler extends FSMDataHandler {
    onPress(event: Event): void;
    onDrag(event: Event): void;
    onRelease(event: Event): void;
}

/**
 * A user interaction for Drag and Drop
 * @author Gwendal DIDOT
 */
export class DnD extends InteractionImpl<SrcTgtPointsData, DnDFSM> {
    private readonly handler: DnDFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(srcOnUpdate: boolean, cancellable: boolean) {
        super(new DnDFSM(cancellable));

        this.handler = new class implements DnDFSMHandler {
            private readonly _parent: DnD;

            public constructor(parent: DnD) {
                this._parent = parent;
            }

            public onPress(evt: MouseEvent): void {
                (this._parent.data as (SrcTgtPointsDataImpl)).setPointData(evt.clientX, evt.clientY, evt.screenX, evt.screenY,
                    evt.button, evt.target ?? undefined, evt.currentTarget ?? undefined);
                this.setTgt(evt);
            }

            public onDrag(evt: MouseEvent): void {
                if (srcOnUpdate) {
                    const d: SrcTgtPointsDataImpl = this._parent.data as (SrcTgtPointsDataImpl);
                    d.setPointData(this._parent.data.getTgtClientX(), this._parent.data.getTgtClientY(), this._parent.data.getTgtScreenX(),
                        this._parent.data.getTgtScreenY(), this._parent.data.getButton(),
                        this._parent.data.getTgtObject(), this._parent.data.getTgtObject());
                }
                this.setTgt(evt);
            }

            public onRelease(evt: MouseEvent): void {
                this.setTgt(evt);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }

            private setTgt(evt: MouseEvent): void {
                (this._parent.data as (SrcTgtPointsDataImpl)).setTgtData(evt.clientX, evt.clientY, evt.screenX, evt.screenY, evt.target ?? undefined);
                (this._parent.data as (SrcTgtPointsDataImpl)).setModifiersData(evt);
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public createDataObject(): SrcTgtPointsData {
        return new SrcTgtPointsDataImpl();
    }
}
