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
import { PointInteraction } from "./PointInteraction";
import { SrcTgtPointsData } from "./SrcTgtPointsData";
import { Optional } from "../../util/Optional";
import { FSM } from "../../fsm/FSM";
import { PressureTransition } from "../../fsm/PressureTransition";
import { ReleaseTransition } from "../../fsm/ReleaseTransition";

export class DnDFSM extends FSM {
    private readonly cancellable: boolean;
    private buttonToCheck: number | undefined;

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

        this.startingState = dragged;

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

            public isGuardOK(event: Event) {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }
        }(this, pressed, cancelled);

        new class extends MoveTransition {
            private readonly _parent: DnDFSM;

            public constructor(parent: DnDFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event) {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }

            public action(event: Event) {
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

            public isGuardOK(event: Event) {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }

            public action(event: Event) {
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

            public isGuardOK(event: Event) {
                return event instanceof MouseEvent && event.button === this._parent.buttonToCheck;
            }

            public action(event: Event) {
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

export interface DnDFSMHandler extends FSMDataHandler {
    onPress(event: Event): void;
    onDrag(event: Event): void;
    onRelease(event: Event): void;
}

/**
 * A user interaction for Drag and Drop
 * @author Gwendal DIDOT
 */
export class DnD extends PointInteraction<SrcTgtPointsData, DnDFSM, Node> implements SrcTgtPointsData {

    /**The object pick at the end of the interaction*/
    private tgtObject: EventTarget | undefined;

    private tgtClientX: number | undefined;

    private tgtClientY: number | undefined;

    private tgtScreenX: number | undefined;

    private tgtScreenY: number | undefined;

    /**
     * Creates the interaction.
     */
    private readonly handler: DnDFSMHandler;

    public constructor(srcOnUpdate: boolean, cancellable: boolean, fsm?: DnDFSM) {
        super(fsm === undefined ? new DnDFSM(cancellable) : fsm);

        this.handler = new class implements DnDFSMHandler {
            private readonly _parent: DnD;

            constructor(parent: DnD) {
                this._parent = parent;
            }

            public onPress(event: MouseEvent): void {
                this._parent.setPointData(event);
                this._parent.setTgtData(event);
            }

            public onDrag(event: MouseEvent): void {
                if (srcOnUpdate) {
                    this._parent.setPointData(event);
                }
                this._parent.setTgtData(event);
            }

            public onRelease(event: MouseEvent): void {
                this._parent.setTgtData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public setTgtData(event: MouseEvent) {
        this.tgtClientX = event.clientX;
        this.tgtClientY = event.clientY;
        this.tgtScreenX = event.screenX;
        this.tgtScreenY = event.screenY;
        this.tgtObject = event.target === null ? undefined : event.target;
    }

    public reinitData(): void {
        super.reinitData();
        this.tgtClientX = undefined;
        this.tgtClientY = undefined;
        this.tgtScreenX = undefined;
        this.tgtScreenY = undefined;
        this.tgtObject = undefined;
    }

    public getData(): SrcTgtPointsData {
        return this;
    }

    public getTgtClientX(): number {
        return this.tgtClientX === undefined ? 0 : this.tgtClientX;
    }

    public getTgtClientY(): number {
        return this.tgtClientY === undefined ? 0 : this.tgtClientY;
    }

    public getTgtScreenX(): number {
        return this.tgtScreenX === undefined ? 0 : this.tgtScreenX;
    }

    public getTgtScreenY(): number {
        return this.tgtScreenY === undefined ? 0 : this.tgtScreenY;
    }

    public getTgtObject(): Optional<EventTarget> {
        return Optional.of(this.tgtObject);
    }

}
