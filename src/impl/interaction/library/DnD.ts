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

import {FSMDataHandler} from "../../../api/fsm/FSMDataHandler";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {CancellingState} from "../../fsm/CancellingState";
import {MoveTransition} from "../../fsm/MoveTransition";
import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import {SrcTgtPointsData, SrcTgtPointsDataImpl} from "../../../api/interaction/SrcTgtPointsData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {PressureTransition} from "../../fsm/PressureTransition";
import {ReleaseTransition} from "../../fsm/ReleaseTransition";
import {InteractionBase} from "../InteractionBase";

/**
 * The FSM for DnD interactions.
 */
export class DnDFSM extends FSMImpl {
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

        const press = new PressureTransition(this.initState, pressed);
        press.action = (event: Event): void => {
            if (event instanceof MouseEvent) {
                this.buttonToCheck = event.button;
                if (dataHandler !== undefined) {
                    dataHandler.onPress(event);
                }
            }
        };

        const relCancel = new ReleaseTransition(pressed, cancelled);
        relCancel.isGuardOK = (event: Event): boolean => event instanceof MouseEvent && event.button === this.buttonToCheck;

        const guardMove = (event: Event): boolean => event instanceof MouseEvent && event.button === this.buttonToCheck;
        const actionMove = (event: Event): void => {
            if (dataHandler !== undefined && event instanceof MouseEvent) {
                dataHandler.onDrag(event);
            }
        };

        const move = new MoveTransition(pressed, dragged);
        move.isGuardOK = guardMove;
        move.action = actionMove;

        const moveDrag = new MoveTransition(dragged, dragged);
        moveDrag.isGuardOK = guardMove;
        moveDrag.action = actionMove;

        const release = new ReleaseTransition(dragged, released);
        release.isGuardOK = (event: Event): boolean => event instanceof MouseEvent && event.button === this.buttonToCheck;
        release.action = (event: Event): void => {
            if (dataHandler !== undefined && event instanceof MouseEvent) {
                dataHandler.onRelease(event);
            }
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
 * @author Gwendal DIDOT
 */
export class DnD extends InteractionBase<SrcTgtPointsData, DnDFSM> {
    private readonly handler: DnDFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(cancellable: boolean) {
        super(new DnDFSM(cancellable));

        this.handler = {
            "onPress": (evt: MouseEvent): void => {
                (this.data as (SrcTgtPointsDataImpl)).setPointData(evt.clientX, evt.clientY, evt.screenX, evt.screenY,
                    evt.button, evt.target ?? undefined, evt.currentTarget ?? undefined);
                this.setTgt(evt);
            },
            "onDrag": (evt: MouseEvent): void => {
                this.setTgt(evt);
            },
            "onRelease": (evt: MouseEvent): void => this.setTgt(evt),
            "reinitData": (): void => this.reinitData()
        };

        this.getFsm().buildFSM(this.handler);
    }

    private setTgt(evt: MouseEvent): void {
        (this.data as (SrcTgtPointsDataImpl)).setTgtData(evt.clientX, evt.clientY, evt.screenX, evt.screenY, evt.target ?? undefined);
        (this.data as (SrcTgtPointsDataImpl)).setModifiersData(evt);
    }

    public createDataObject(): SrcTgtPointsData {
        return new SrcTgtPointsDataImpl();
    }
}
