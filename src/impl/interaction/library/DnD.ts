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

import {EscapeKeyPressureTransition} from "../../fsm/EscapeKeyPressureTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {MouseTransition} from "../../fsm/MouseTransition";
import {InteractionBase} from "../InteractionBase";
import {SrcTgtPointsDataImpl} from "../SrcTgtPointsDataImpl";
import type {PointData} from "../../../api/interaction/PointData";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

/**
 * The FSM for DnD interactions.
 */
class DnDFSM extends FSMImpl<DnDFSMHandler> {
    private readonly cancellable: boolean;

    private buttonToCheck: number | undefined;

    /**
     * Creates the FSM
     * @param cancellable - True: the FSM can be cancelled using the ESC key.
     * @param logger - The logger to use
     * @param dataHandler - The handler that will receive notifications from the FSM.
     */
    public constructor(cancellable: boolean, logger: Logger, dataHandler: DnDFSMHandler) {
        super(logger, dataHandler);
        this.cancellable = cancellable;

        const pressed = this.addStdState("pressed");
        const dragged = this.addStdState("dragged", true);
        const cancelled = this.addCancellingState("cancelled");

        new MouseTransition(this.initState, pressed, "mousedown",
            (evt: MouseEvent): void => {
                this.buttonToCheck = evt.button;
                this.dataHandler?.onPress(evt);
            });

        new MouseTransition(pressed, cancelled, "mouseup", (evt: MouseEvent): boolean => evt.button === this.buttonToCheck);

        const move = new MouseTransition(pressed, dragged, "mousemove",
            (evt: MouseEvent): void => {
                this.dataHandler?.onDrag(evt);
            },
            (evt: MouseEvent): boolean => evt.button === this.buttonToCheck);

        new MouseTransition(dragged, dragged, "mousemove", move.action, move.guard);

        new MouseTransition(dragged, this.addTerminalState("released"), "mouseup",
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
            new MouseTransition(dragged, cancelled, "mouseup",
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
 * @category Interaction Library
 */
export class DnD extends InteractionBase<SrcTgtPointsData<PointData>, SrcTgtPointsDataImpl> {
    /**
     * Creates the interaction.
     * @param cancellable - True: the interaction can be cancelled
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(cancellable: boolean, logger: Logger, name?: string) {
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

        super(new DnDFSM(cancellable, logger, handler), new SrcTgtPointsDataImpl(), logger, name ?? DnD.name);
    }
}
