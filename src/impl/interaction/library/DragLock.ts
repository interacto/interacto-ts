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
import {FSMImpl} from "../../fsm/FSMImpl";
import {MoveTransition} from "../../fsm/MoveTransition";
import {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "./PointDataImpl";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import {Flushable} from "./Flushable";

export class DragLockFSM extends FSMImpl {
    public readonly firstDbleClick: DoubleClickFSM;

    public readonly sndDbleClick: DoubleClickFSM;

    protected checkButton?: number;

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

        const subTr = new SubFSMTransition(this.initState, locked, this.firstDbleClick);
        subTr.action = (): void => {
            const checkButton = this.firstDbleClick.getCheckButton();
            this.sndDbleClick.setCheckButton(checkButton);
            cancelDbleClick.setCheckButton(checkButton);
        };

        new SubFSMTransition(locked, cancelled, cancelDbleClick);

        const moveAction = (event: MouseEvent): void => {
            this.getDataHandler()?.onMove(event);
        };
        const movelock = new MoveTransition(locked, moved);
        movelock.action = moveAction;
        const move = new MoveTransition(moved, moved);
        move.action = moveAction;
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
export class DragLock extends InteractionBase<SrcTgtPointsData, DragLockFSM> {
    private readonly handler: DragLockFSMHandler;

    private readonly firstClick: DoubleClick;

    private readonly sndClick: DoubleClick;

    /**
     * Creates a drag lock.
     */
    public constructor() {
        super(new DragLockFSM());

        this.handler = {
            "onMove": (evt: MouseEvent): void => {
                (this.sndClick.firstClick.getData() as (PointDataImpl)).setPointData(evt.clientX, evt.clientY, evt.screenX,
                    evt.screenY, evt.button, evt.target ?? undefined, evt.currentTarget ?? undefined);
                (this.sndClick.firstClick.getData() as (PointDataImpl)).setModifiersData(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.firstClick = new DoubleClick(this.getFsm().firstDbleClick);
        this.sndClick = new DoubleClick(this.getFsm().sndDbleClick);
        this.getFsm().buildFSM(this.handler);
    }

    public reinitData(): void {
        super.reinitData();
        this.firstClick.reinitData();
        this.sndClick.reinitData();
    }

    public createDataObject(): Flushable & SrcTgtPointsData {
        return {
            "getTgtObject": (): EventTarget | undefined => (this.sndClick.getData().getButton() === undefined
                ? this.firstClick.getData().getSrcObject()
                : this.sndClick.getData().getSrcObject()),

            "getTgtClientX": (): number => (this.sndClick.getData().getButton() === undefined ? this.data.getSrcClientX()
                : this.sndClick.getData().getSrcClientX()),

            "getTgtClientY": (): number => (this.sndClick.getData().getButton() === undefined ? this.data.getSrcClientY()
                : this.sndClick.getData().getSrcClientY()),

            "getTgtScreenX": (): number => (this.sndClick.getData().getButton() === undefined ? this.data.getSrcScreenX()
                : this.sndClick.getData().getSrcScreenX()),

            "getTgtScreenY": (): number => (this.sndClick.getData().getButton() === undefined ? this.data.getSrcScreenY()
                : this.sndClick.getData().getSrcScreenY()),

            "isAltPressed": (): boolean => this.firstClick.getData().isAltPressed(),

            "isCtrlPressed": (): boolean => this.firstClick.getData().isCtrlPressed(),

            "isShiftPressed": (): boolean => this.firstClick.getData().isShiftPressed(),

            "isMetaPressed": (): boolean => this.firstClick.getData().isMetaPressed(),

            "getButton": (): number | undefined => this.firstClick.getData().getButton(),

            "getSrcClientX": (): number => this.firstClick.getData().getSrcClientX(),

            "getSrcClientY": (): number => this.firstClick.getData().getSrcClientY(),

            "getSrcObject": (): EventTarget | undefined => this.firstClick.getData().getSrcObject(),

            "getSrcScreenX": (): number => this.firstClick.getData().getSrcScreenX(),

            "getSrcScreenY": (): number => this.firstClick.getData().getSrcScreenY(),

            "getCurrentTarget": (): EventTarget | undefined => this.firstClick.getData().getCurrentTarget(),

            "flush": (): void => {
                (this.firstClick.getData() as unknown as Flushable).flush();
                (this.sndClick.getData() as unknown as Flushable).flush();
            }
        };
    }
}
