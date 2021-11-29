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

import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {DoubleClick, DoubleClickFSM} from "./DoubleClick";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {StdState} from "../../fsm/StdState";
import {SubFSMTransition} from "../../fsm/SubFSMTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import {InteractionBase} from "../InteractionBase";
import type {PointDataImpl} from "../PointDataImpl";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import {SrcTgtPointsDataImpl} from "../SrcTgtPointsDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import {MouseMoveTransition} from "../../fsm/MouseMoveTransition";

class DragLockFSM extends FSMImpl {
    public readonly firstDbleClick: DoubleClickFSM;

    public readonly sndDbleClick: DoubleClickFSM;

    protected checkButton?: number;

    public constructor() {
        super();
        this.firstDbleClick = new DoubleClickFSM();
        this.sndDbleClick = new DoubleClickFSM();
    }

    // eslint-disable-next-line accessor-pairs
    public override set log(log: boolean) {
        super.log = log;
        this.firstDbleClick.log = log;
        this.sndDbleClick.log = log;
    }

    public override reinit(): void {
        super.reinit();
        this.firstDbleClick.reinit();
        this.sndDbleClick.reinit();
        this.checkButton = undefined;
    }

    public override fullReinit(): void {
        super.fullReinit();
        this.firstDbleClick.fullReinit();
        this.sndDbleClick.fullReinit();
    }

    public override getDataHandler(): DragLockFSMHandler | undefined {
        return this.dataHandler as DragLockFSMHandler;
    }

    public override buildFSM(dataHandler: DragLockFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const cancelDbleClick = new DoubleClickFSM();
        const errorHandler = {
            "fsmError": (err: unknown): void => {
                this.notifyHandlerOnError(err);
            }
        };
        this.firstDbleClick.buildFSM();
        this.sndDbleClick.buildFSM();
        cancelDbleClick.buildFSM();
        this.firstDbleClick.addHandler(errorHandler);
        this.sndDbleClick.addHandler(errorHandler);
        cancelDbleClick.addHandler(errorHandler);

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
            dataHandler.onFirstDbleClick();
        };

        new SubFSMTransition(locked, cancelled, cancelDbleClick);

        const moveAction = (event: MouseEvent): void => {
            this.getDataHandler()?.onMove(event);
        };
        const movelock = new MouseMoveTransition(locked, moved);
        movelock.action = moveAction;
        const move = new MouseMoveTransition(moved, moved);
        move.action = moveAction;
        new EscapeKeyPressureTransition(locked, cancelled);
        new EscapeKeyPressureTransition(moved, cancelled);
        new SubFSMTransition(moved, dropped, this.sndDbleClick);
    }
}

interface DragLockFSMHandler extends FSMDataHandler {
    onMove(event: MouseEvent): void;
    onFirstDbleClick(): void;
}

/**
 * The drag-lock user interaction
 */
export class DragLock extends InteractionBase<SrcTgtPointsData<PointData>, SrcTgtPointsDataImpl, DragLockFSM> {
    /**
     * Creates a drag lock.
     */
    public constructor() {
        super(new DragLockFSM(), new SrcTgtPointsDataImpl());

        const handler: DragLockFSMHandler = {
            "onMove": (evt: MouseEvent): void => {
                (this.data.tgt as PointDataImpl).copy(evt);
            },
            "onFirstDbleClick": (): void => {
                // On the first double-click we have to set the tgt point by copying the src data.
                (this.data.tgt as PointDataImpl).copy(this.data.src);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        // We give the interactions to the initial and final double-clicks as these interactions
        // will contain the data: so that these interactions will fill the data of the draglock.
        new DoubleClick(this.fsm.firstDbleClick, this.data.src as PointDataImpl);
        new DoubleClick(this.fsm.sndDbleClick, this.data.tgt as PointDataImpl);
        this.fsm.buildFSM(handler);
    }
}
