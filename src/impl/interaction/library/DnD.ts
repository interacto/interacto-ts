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
     * @param dataHandler - The handler that will receive notifications from the FSM.
     */
    public constructor(cancellable: boolean, dataHandler: DnDFSMHandler) {
        super(dataHandler);
        this.cancellable = cancellable;

        const pressed = this.addStdState("pressed");
        const dragged = this.addStdState("dragged", true);
        const cancelled = this.addCancellingState("cancelled");

        new MouseDownTransition(this.initState, pressed,
            (evt: MouseEvent): void => {
                this.buttonToCheck = evt.button;
                this.dataHandler?.onPress(evt);
            });

        new MouseUpTransition(pressed, cancelled, (evt: MouseEvent): boolean => evt.button === this.buttonToCheck);

        const move = new MouseMoveTransition(pressed, dragged,
            (evt: MouseEvent): void => {
                this.dataHandler?.onDrag(evt);
            },
            (evt: MouseEvent): boolean => evt.button === this.buttonToCheck);

        new MouseMoveTransition(dragged, dragged, move.action, move.isGuardOK);

        new MouseUpTransition(dragged, this.addTerminalState("released"),
            (event: MouseEvent): void => {
                this.dataHandler?.onRelease(event);
            },
            (event: MouseEvent): boolean => {
                const tgt = event.currentTarget;
                return event.button === this.buttonToCheck && (!(tgt instanceof Element) || !tgt.classList.contains("ioDwellSpring"));
            });

        if (this.cancellable) {
            new EscapeKeyPressureTransition(pressed, cancelled);
            new EscapeKeyPressureTransition(dragged, cancelled);
            new MouseUpTransition(dragged, cancelled,
                (evt: MouseEvent): boolean => {
                    const tgt = evt.currentTarget;
                    return evt.button === this.buttonToCheck && tgt instanceof Element && tgt.classList.contains("ioDwellSpring");
                });
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
