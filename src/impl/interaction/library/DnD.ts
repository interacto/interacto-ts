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
import {MoveTransition} from "../../fsm/MoveTransition";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {PressureTransition} from "../../fsm/PressureTransition";
import {ReleaseTransition} from "../../fsm/ReleaseTransition";
import {InteractionBase} from "../InteractionBase";
import {SrcTgtPointsDataImpl} from "../SrcTgtPointsDataImpl";
import type {PointData} from "../../../api/interaction/PointData";

/**
 * The FSM for DnD interactions.
 */
export class DnDFSM extends FSMImpl {
    private readonly cancellable: boolean;

    private buttonToCheck?: number;

    /**
     * Creates the FSM
     * @param cancellable - True: the FSM can be cancelled using the ESC key.
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

        const press = new PressureTransition(this.initState, pressed);
        press.action = (event: MouseEvent): void => {
            this.buttonToCheck = event.button;
            dataHandler?.onPress(event);
        };

        const relCancel = new ReleaseTransition(pressed, cancelled);
        relCancel.isGuardOK = (event: MouseEvent): boolean => event.button === this.buttonToCheck;

        const guardMove = (event: MouseEvent): boolean => event.button === this.buttonToCheck;
        const actionMove = (event: MouseEvent): void => {
            dataHandler?.onDrag(event);
        };

        const move = new MoveTransition(pressed, dragged);
        move.isGuardOK = guardMove;
        move.action = actionMove;

        const moveDrag = new MoveTransition(dragged, dragged);
        moveDrag.isGuardOK = guardMove;
        moveDrag.action = actionMove;

        const release = new ReleaseTransition(dragged, released);
        release.isGuardOK = (event: MouseEvent): boolean => event.button === this.buttonToCheck;
        release.action = (event: MouseEvent): void => {
            dataHandler?.onRelease(event);
        };

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
 */
export class DnD extends InteractionBase<SrcTgtPointsData<PointData>, SrcTgtPointsDataImpl, DnDFSM> {
    private readonly handler: DnDFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(cancellable: boolean) {
        super(new DnDFSM(cancellable), new SrcTgtPointsDataImpl());

        this.handler = {
            "onPress": (evt: MouseEvent): void => {
                this.data.copySrc(evt);
                this.data.copyTgt(evt);
            },
            "onDrag": (evt: MouseEvent): void => {
                this.data.copyTgt(evt);
            },
            "onRelease": (evt: MouseEvent): void => {
                this.data.copyTgt(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }
}
