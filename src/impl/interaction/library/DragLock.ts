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

import {DoubleClick, DoubleClickFSM} from "./DoubleClick";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {MouseTransition} from "../../fsm/MouseTransition";
import {SubFSMTransitionImpl} from "../../fsm/SubFSMTransitionImpl";
import {InteractionBase} from "../InteractionBase";
import {SrcTgtPointsDataImpl} from "../SrcTgtPointsDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import type {Logger} from "../../../api/logging/Logger";

interface DragLockFSMHandler {
    onMove(event: MouseEvent): void;
    onFirstDbleClick(): void;
}

class DragLockFSM extends FSMImpl {
    public readonly firstDbleClick: DoubleClickFSM;

    public readonly sndDbleClick: DoubleClickFSM;

    protected checkButton: number | undefined;

    public constructor(logger: Logger, handler: DragLockFSMHandler,
                       dbleClick1Action: (evt: MouseEvent) => void,
                       dbleClick2Action: (evt: MouseEvent) => void, toleranceMove?: number) {
        super(logger);
        this.firstDbleClick = new DoubleClickFSM(logger, dbleClick1Action, toleranceMove);
        this.sndDbleClick = new DoubleClickFSM(logger, dbleClick2Action, toleranceMove);

        const cancelDbleClick = new DoubleClickFSM(logger);
        const errorHandler = {
            "fsmError": (err: unknown): void => {
                this.notifyHandlerOnError(err);
            }
        };

        this.firstDbleClick.addHandler(errorHandler);
        this.sndDbleClick.addHandler(errorHandler);
        cancelDbleClick.addHandler(errorHandler);

        const cancelled = this.addCancellingState("cancelled");
        const locked = this.addStdState("locked");
        const moved = this.addStdState("moved");

        new SubFSMTransitionImpl(this.initState, locked, this.firstDbleClick,
            (): void => {
                const checkButton = this.firstDbleClick.getCheckButton();
                this.sndDbleClick.setCheckButton(checkButton);
                cancelDbleClick.setCheckButton(checkButton);
                handler.onFirstDbleClick();
            });

        new SubFSMTransitionImpl(locked, cancelled, cancelDbleClick);

        const move = new MouseTransition(locked, moved, "mousemove",
            (event: MouseEvent): void => {
                handler.onMove(event);
            });

        new MouseTransition(moved, moved, "mousemove", move.action);

        new EscapeKeyPressureTransition(locked, cancelled);
        new EscapeKeyPressureTransition(moved, cancelled);
        new SubFSMTransitionImpl(moved, this.addTerminalState("dropped"), this.sndDbleClick);
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
}

/**
 * The drag-lock user interaction
 * @category Interaction Library
 */
export class DragLock extends InteractionBase<SrcTgtPointsData<PointData>, SrcTgtPointsDataImpl> {
    /**
     * Creates a drag lock.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     * @param toleranceMove - The accepted number of pixel moves between the pressure and the release of the click
     */
    public constructor(logger: Logger, name?: string, toleranceMove?: number) {
        const handler: DragLockFSMHandler = {
            "onMove": (evt: MouseEvent): void => {
                this._data.tgt.copy(evt);
            },
            "onFirstDbleClick": (): void => {
                // On the first double-click we have to set the tgt point by copying the src data.
                this._data.tgt.copy(this.data.src);
            }
        };

        const theFSM = new DragLockFSM(logger, handler, (evt: MouseEvent): void => {
            this._data.src.copy(evt);
        }, (evt: MouseEvent): void => {
            this._data.tgt.copy(evt);
        }, toleranceMove);

        super(theFSM, new SrcTgtPointsDataImpl(), logger, name ?? DragLock.name);

        /*
         * We give the interactions to the initial and final double-clicks as these interactions
         * will contain the data: so that these interactions will fill the data with the draglock.
         */
        new DoubleClick(logger, theFSM.firstDbleClick, this._data.src);
        new DoubleClick(logger, theFSM.sndDbleClick, this._data.tgt);
    }
}
