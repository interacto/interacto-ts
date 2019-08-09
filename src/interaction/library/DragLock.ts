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

import {FSMDataHandler} from "../FSMDataHandler";
import {TSFSM} from "../TSFSM";
import {TSInteraction} from "../TSInteraction";
import {DoubleClick, DoubleClickFSM} from "./DoubleClick";
import {TerminalState} from "../../src-core/fsm/TerminalState";
import {CancellingState} from "../../src-core/fsm/CancellingState";
import {StdState} from "../../src-core/fsm/StdState";
import {SubFSMTransition} from "../../src-core/fsm/SubFSMTransition";
import {InputState} from "../../src-core/fsm/InputState";
import {FSM} from "../../src-core/fsm/FSM";
import {OutputState} from "../../src-core/fsm/OutputState";
import {MoveTransition} from "../MoveTransition";
import {EscapeKeyPressureTransition} from "../EscapeKeyPressureTransition";
import {SrcTgtPointsData} from "./SrcTgtPointsData";
import {Optional} from "../../util/Optional";

export class DragLockFSM extends TSFSM<DragLockFSMHandler> {
    public readonly firstDbleClick: DoubleClickFSM;
    public readonly sndDbleClick: DoubleClickFSM;
    protected checkButton: number | undefined;

    public constructor() {
        super();
        this.firstDbleClick = new DoubleClickFSM();
        this.sndDbleClick = new DoubleClickFSM();
    }

    public buildFSM(dataHandler: DragLockFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const cancelDbleClick = new DoubleClickFSM();
        this.firstDbleClick.buildFSM();
        this.sndDbleClick.buildFSM();
        cancelDbleClick.buildFSM();
        const dropped = new TerminalState<Event>(this, "dropped");
        const cancelled = new CancellingState<Event>(this, "cancelled");
        const locked = new StdState<Event>(this, "locked");
        const moved = new StdState<Event>(this, "moved");

        this.addState(dropped);
        this.addState(cancelled);
        this.addState(locked);
        this.addState(moved);

        new class extends SubFSMTransition<Event> {
            private readonly _parent: DragLockFSM;

            public constructor(parent: DragLockFSM, srcState: OutputState<Event>, tgtState: InputState<Event>, fsm: FSM<Event>) {
                super(srcState, tgtState, fsm);
                this._parent = parent;
            }

            protected action(event: Event): void {
                this._parent.checkButton = this._parent.firstDbleClick.getCheckButton();
                this._parent.sndDbleClick.setCheckButton(this._parent.checkButton);
                cancelDbleClick.setCheckButton(this._parent.checkButton);
            }
        }(this, this.initState, locked, this.firstDbleClick);

        new SubFSMTransition<Event>(locked, cancelled, cancelDbleClick);

        new class extends MoveTransition {
            private readonly _parent: DragLockFSM;

            public constructor(parent: DragLockFSM, srcState: OutputState<Event>, tgtState: InputState<Event>) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public isGuardOK(event: Event): boolean {
                return super.isGuardOK(event) &&
                    (this._parent.checkButton === undefined || event instanceof MouseEvent && event.button === this._parent.checkButton);
            }

            protected action(event: Event): void {
                if (this._parent.dataHandler !== undefined && event instanceof MouseEvent) {
                    this._parent.dataHandler.onMove(event);
                }
            }
        }(this, locked, moved);

        new EscapeKeyPressureTransition(locked, cancelled);
        new EscapeKeyPressureTransition(moved, cancelled);
        new SubFSMTransition<Event>(moved, dropped, this.sndDbleClick);
    }
}

export interface DragLockFSMHandler extends FSMDataHandler {
    onMove(event: MouseEvent): void;
}

export class DragLock extends TSInteraction<SrcTgtPointsData, DragLockFSM, Event> implements SrcTgtPointsData {
    private readonly handler: DragLockFSMHandler;
    private readonly firstClick: DoubleClick;
    private readonly sndClick: DoubleClick;

    public constructor() {
        super(new DragLockFSM());

        this.handler = new class implements DragLockFSMHandler {
            private readonly _parent: DragLock;

            public constructor(parent: DragLock) {
                this._parent = parent;
            }

            public onMove(event: MouseEvent): void {
                this._parent.sndClick.firstClick.setPointData(event);
                this._parent.sndClick.firstClick.pointData.setModifiersData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);

        this.firstClick = new DoubleClick(this.getFsm().firstDbleClick);
        this.sndClick = new DoubleClick(this.getFsm().sndDbleClick);
        this.getFsm().buildFSM(this.handler);
    }

    public reinitData(): void {
        super.reinitData();
        this.firstClick.reinitData();
        this.sndClick.reinitData();
    }

    public getData(): SrcTgtPointsData {
        return this;
    }

    public getTgtObject(): Optional<EventTarget> {
        return this.sndClick.getData().getSrcObject();
    }

    public getTgtClientX() {
        return this.sndClick.getData().getButton() === undefined ? this.getSrcClientX() : this.sndClick.getData().getSrcClientX();
    }

    public getTgtClientY() {
        return this.sndClick.getData().getButton() === undefined ? this.getSrcClientY() : this.sndClick.getData().getSrcClientY();
    }

    public getTgtScreenX() {
        return this.sndClick.getData().getButton() === undefined ? this.getSrcScreenX() : this.sndClick.getData().getSrcScreenX();
    }

    public getTgtScreenY() {
        return this.sndClick.getData().getButton() === undefined ? this.getSrcScreenY() : this.sndClick.getData().getSrcScreenY();
    }

    public isAltPressed(): boolean {
        return this.firstClick.getData().isAltPressed();
    }

    public isCtrlPressed(): boolean {
        return this.firstClick.getData().isCtrlPressed();
    }

    public isShiftPressed(): boolean {
        return this.firstClick.getData().isShiftPressed();
    }

    public isMetaPressed(): boolean {
        return this.firstClick.getData().isMetaPressed();
    }

    public getButton(): number | undefined {
        return this.firstClick.getData().getButton();
    }

    public getSrcClientX(): number {
        return this.firstClick.getData().getSrcClientX();
    }

    public getSrcClientY(): number {
        return this.firstClick.getData().getSrcClientY();
    }

    public getSrcObject(): Optional<EventTarget> {
        return this.firstClick.getData().getSrcObject();
    }

    public getSrcScreenX(): number {
        return this.firstClick.getData().getSrcScreenX();
    }

    public getSrcScreenY(): number {
        return this.firstClick.getData().getSrcScreenY();
    }

    public getCurrentTarget(): Optional<EventTarget> {
        return this.firstClick.getData().getCurrentTarget();
    }
}
