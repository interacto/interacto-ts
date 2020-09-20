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
import {DoubleClick, DoubleClickFSM} from "./DoubleClick";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {StdState} from "../../fsm/StdState";
import {SubFSMTransition} from "../../fsm/SubFSMTransition";
import {InputState} from "../../fsm/InputState";
import {FSM} from "../../fsm/FSM";
import {OutputState} from "../../fsm/OutputState";
import {MoveTransition} from "../../fsm/MoveTransition";
import {SrcTgtPointsData} from "./SrcTgtPointsData";
import {InteractionImpl} from "../InteractionImpl";
import {PointDataImpl} from "./PointDataImpl";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";

export class DragLockFSM extends FSM {
    public readonly firstDbleClick: DoubleClickFSM;

    public readonly sndDbleClick: DoubleClickFSM;

    protected checkButton: number | undefined;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly MoveTransitionDragLock = class extends MoveTransition {
        private readonly parent: DragLockFSM;

        public constructor(dgfsm: DragLockFSM, srcState: OutputState, tgtState: InputState) {
            super(srcState, tgtState);
            this.parent = dgfsm;
        }

        protected action(event: Event): void {
            const handler = this.parent.getDataHandler();
            if (handler !== undefined && event instanceof MouseEvent) {
                handler.onMove(event);
            }
        }
    };

    public constructor() {
        super();
        this.firstDbleClick = new DoubleClickFSM();
        this.sndDbleClick = new DoubleClickFSM();
    }

    public log(log: boolean): void {
        super.log(log);
        this.firstDbleClick.log(log);
        this.sndDbleClick.log(log);
    }

    public reinit(): void {
        super.reinit();
        this.firstDbleClick.reinit();
        this.sndDbleClick.reinit();
        this.checkButton = undefined;
    }

    public fullReinit(): void {
        super.fullReinit();
        this.firstDbleClick.fullReinit();
        this.sndDbleClick.fullReinit();
    }

    public getDataHandler(): DragLockFSMHandler | undefined {
        return this.dataHandler as DragLockFSMHandler;
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
        const dropped = new TerminalState(this, "dropped");
        const cancelled = new CancellingState(this, "cancelled");
        const locked = new StdState(this, "locked");
        const moved = new StdState(this, "moved");

        this.addState(dropped);
        this.addState(cancelled);
        this.addState(locked);
        this.addState(moved);

        new class extends SubFSMTransition {
            private readonly parent: DragLockFSM;

            public constructor(dlFSM: DragLockFSM, srcState: OutputState, tgtState: InputState, fsm: FSM) {
                super(srcState, tgtState, fsm);
                this.parent = dlFSM;
            }

            protected action(): void {
                const checkButton = this.parent.firstDbleClick.getCheckButton();
                this.parent.sndDbleClick.setCheckButton(checkButton);
                cancelDbleClick.setCheckButton(checkButton);
            }
        }(this, this.initState, locked, this.firstDbleClick);

        new SubFSMTransition(locked, cancelled, cancelDbleClick);
        new DragLockFSM.MoveTransitionDragLock(this, locked, moved);
        new DragLockFSM.MoveTransitionDragLock(this, moved, moved);
        new EscapeKeyPressureTransition(locked, cancelled);
        new EscapeKeyPressureTransition(moved, cancelled);
        new SubFSMTransition(moved, dropped, this.sndDbleClick);
    }
}

interface DragLockFSMHandler extends FSMDataHandler {
    onMove(event: MouseEvent): void;
}

/**
 * The drag-lock user interaction
 */
export class DragLock extends InteractionImpl<SrcTgtPointsData, DragLockFSM> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly DragLockData = class implements SrcTgtPointsData {
        private readonly draglock: DragLock;

        public constructor(draglock: DragLock) {
            this.draglock = draglock;
        }

        public getTgtObject(): EventTarget | undefined {
            return this.draglock.sndClick.getData().getSrcObject();
        }

        public getTgtClientX(): number {
            return this.draglock.sndClick.getData().getButton() === undefined ? this.getSrcClientX()
                : this.draglock.sndClick.getData().getSrcClientX();
        }

        public getTgtClientY(): number {
            return this.draglock.sndClick.getData().getButton() === undefined ? this.getSrcClientY()
                : this.draglock.sndClick.getData().getSrcClientY();
        }

        public getTgtScreenX(): number {
            return this.draglock.sndClick.getData().getButton() === undefined ? this.getSrcScreenX()
                : this.draglock.sndClick.getData().getSrcScreenX();
        }

        public getTgtScreenY(): number {
            return this.draglock.sndClick.getData().getButton() === undefined ? this.getSrcScreenY()
                : this.draglock.sndClick.getData().getSrcScreenY();
        }

        public isAltPressed(): boolean {
            return this.draglock.firstClick.getData().isAltPressed();
        }

        public isCtrlPressed(): boolean {
            return this.draglock.firstClick.getData().isCtrlPressed();
        }

        public isShiftPressed(): boolean {
            return this.draglock.firstClick.getData().isShiftPressed();
        }

        public isMetaPressed(): boolean {
            return this.draglock.firstClick.getData().isMetaPressed();
        }

        public getButton(): number | undefined {
            return this.draglock.firstClick.getData().getButton();
        }

        public getSrcClientX(): number {
            return this.draglock.firstClick.getData().getSrcClientX();
        }

        public getSrcClientY(): number {
            return this.draglock.firstClick.getData().getSrcClientY();
        }

        public getSrcObject(): EventTarget | undefined {
            return this.draglock.firstClick.getData().getSrcObject();
        }

        public getSrcScreenX(): number {
            return this.draglock.firstClick.getData().getSrcScreenX();
        }

        public getSrcScreenY(): number {
            return this.draglock.firstClick.getData().getSrcScreenY();
        }

        public getCurrentTarget(): EventTarget | undefined {
            return this.draglock.firstClick.getData().getCurrentTarget();
        }

        public flush(): void {
            this.draglock.firstClick.getData().flush();
            this.draglock.sndClick.getData().flush();
        }
    };

    private readonly handler: DragLockFSMHandler;

    private readonly firstClick: DoubleClick;

    private readonly sndClick: DoubleClick;

    /**
     * Creates a drag lock.
     */
    public constructor() {
        super(new DragLockFSM());

        this.handler = new class implements DragLockFSMHandler {
            private readonly _parent: DragLock;

            public constructor(parent: DragLock) {
                this._parent = parent;
            }

            public onMove(evt: MouseEvent): void {
                (this._parent.sndClick.firstClick.getData() as (PointDataImpl)).setPointData(evt.clientX, evt.clientY, evt.screenX,
                    evt.screenY, evt.button, evt.target ?? undefined, evt.currentTarget ?? undefined);
                (this._parent.sndClick.firstClick.getData() as (PointDataImpl)).setModifiersData(evt);
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

    public createDataObject(): SrcTgtPointsData {
        return new DragLock.DragLockData(this);
    }
}
