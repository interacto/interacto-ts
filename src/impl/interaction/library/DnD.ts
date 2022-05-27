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
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {MouseDownTransition} from "../../fsm/MouseDownTransition";
import {MouseUpTransition} from "../../fsm/MouseUpTransition";
import {InteractionBase} from "../InteractionBase";
import {SrcTgtPointsDataImpl} from "../SrcTgtPointsDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import {MouseMoveTransition} from "../../fsm/MouseMoveTransition";

/**
 * The FSM for DnD interactions.
 */
class DnDFSM extends FSMImpl<DnDFSMHandler> {
    private readonly cancellable: boolean;

    private buttonToCheck?: number;

    /**
     * Creates the FSM
     * @param cancellable - True: the FSM can be cancelled using the ESC key.
     */
    public constructor(cancellable: boolean, dataHandler: DnDFSMHandler) {
        super(dataHandler);
        this.cancellable = cancellable;

        const pressed: StdState = new StdState(this, "pressed");
        const dragged: StdState = new StdState(this, "dragged");
        const released: TerminalState = new TerminalState(this, "released");
        const cancelled: CancellingState = new CancellingState(this, "cancelled");

        this.addState(pressed);
        this.addState(dragged);
        this.addState(released);
        this.addState(cancelled);
        this.startingState = dragged;

        const press = new MouseDownTransition(this.initState, pressed);
        press.action = (event: MouseEvent): void => {
            this.buttonToCheck = event.button;
            this.dataHandler?.onPress(event);
        };

        const relCancel = new MouseUpTransition(pressed, cancelled);
        relCancel.isGuardOK = (event: MouseEvent): boolean => event.button === this.buttonToCheck;

        const guardMove = (event: MouseEvent): boolean => event.button === this.buttonToCheck;
        const actionMove = (event: MouseEvent): void => {
            this.dataHandler?.onDrag(event);
        };

        const move = new MouseMoveTransition(pressed, dragged);
        move.isGuardOK = guardMove;
        move.action = actionMove;

        const moveDrag = new MouseMoveTransition(dragged, dragged);
        moveDrag.isGuardOK = guardMove;
        moveDrag.action = actionMove;

        const release = new MouseUpTransition(dragged, released);
        release.isGuardOK = (event: MouseEvent): boolean => {
            const tgt = event.currentTarget;
            return event.button === this.buttonToCheck && (!(tgt instanceof Element) || !tgt.classList.contains("ioDwellSpring"));
        };
        release.action = (event: MouseEvent): void => {
            this.dataHandler?.onRelease(event);
        };
        this.configureCancellation(pressed, dragged, cancelled);
    }

    private configureCancellation(pressed: StdState, dragged: StdState, cancelled: CancellingState): void {
        if (this.cancellable) {
            new EscapeKeyPressureTransition(pressed, cancelled);
            new EscapeKeyPressureTransition(dragged, cancelled);
            const releaseCancel = new MouseUpTransition(dragged, cancelled);
            releaseCancel.isGuardOK = (event: MouseEvent): boolean => {
                const tgt = event.currentTarget;
                return event.button === this.buttonToCheck && tgt instanceof Element && tgt.classList.contains("ioDwellSpring");
            };
        }
    }

    public override reinit(): void {
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
 */
export class DnD extends InteractionBase<SrcTgtPointsData<PointData>, SrcTgtPointsDataImpl, DnDFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(cancellable: boolean) {
        const handler: DnDFSMHandler = {
            "onPress": (evt: MouseEvent): void => {
                this._data.copySrc(evt);
                this._data.copyTgt(evt);
            },
            "onDrag": (evt: MouseEvent): void => {
                this._data.copyTgt(evt);
            },
            "onRelease": (evt: MouseEvent): void => {
                this._data.copyTgt(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new DnDFSM(cancellable, handler), new SrcTgtPointsDataImpl());
    }
}
