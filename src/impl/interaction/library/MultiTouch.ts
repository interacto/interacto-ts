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

import {TouchDnDFSM} from "./TouchDnD";
import {ConcurrentAndFSM} from "../../fsm/ConcurrentAndFSM";
import {ConcurrentInteraction} from "../ConcurrentInteraction";
import {MultiTouchDataImpl} from "../MultiTouchDataImpl";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {TouchDnDFSMHandler} from "./TouchDnD";
import type {MultiTouchData} from "../../../api/interaction/MultiTouchData";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM that defines a multi-touch interaction (that works like a DnD)
 */
export class MultiTouchFSM extends ConcurrentAndFSM<TouchDnDFSM, TouchDnDFSMHandler> {
    /**
     * Creates the FSM.
     * @param nbTouch - The number of touches of the interaction
     * @param totalReinit - Defines whether a cancellation of one of the fsms, reinits all the fsms.
     * @param logger - The logger to use for this interaction
     * @param dataHandler - The data handler the FSM will use
     * @param movementRequired - Whether the DnD starts after the touch point has begun moving (default)
     * or as soon as the screen is touched. The latter is used for the MultiTouch interaction.
     */
    public constructor(nbTouch: number, totalReinit: boolean, logger: Logger, dataHandler: TouchDnDFSMHandler, movementRequired = false) {
        super(Array.from(Array.from({"length": nbTouch}).keys(), _ => new TouchDnDFSM(false, logger, dataHandler, movementRequired)),
            logger, totalReinit ? [new TouchDnDFSM(false, logger, dataHandler, movementRequired)] : [], totalReinit, dataHandler);
    }

    public override process(event: Event): boolean {
        if (!(event instanceof TouchEvent)) {
            return false;
        }

        let processed = false;
        let res = false;

        // checking lost touch event
        if (event.type === "touchstart") {
            const ids = new Set(Array.from(event.touches, touch => touch.identifier));
            const losts = this.conccurFSMs.filter(fsm => {
                const id = fsm.getTouchId();
                return id !== undefined && !ids.has(id);
            });
            for (const lost of losts) {
                lost.reinit();
            }
        }

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < event.changedTouches.length; i++) {
            // Finding an FSM that is currently running with this ID
            const first: TouchDnDFSM | undefined = this.conccurFSMs
                .find(fsm => fsm.getTouchId() !== undefined && fsm.getTouchId() === event.changedTouches[i]?.identifier);

            if (first === undefined) {
                /*
                 * If no FSM found, two meanings:
                 * 1/ the touch event is unexpected since all the FSMs are running, so cancelling
                 */
                const remainingFSM = this.conccurFSMs.find(fsm => fsm.getTouchId() === undefined);
                if (remainingFSM === undefined) {
                    this.onCancelling();
                    res = false;
                } else {
                    // 2/ There exists an FSM that is free to process the new touch
                    res = remainingFSM.process(event) || res;
                }
            } else {
                processed = true;
                res = first.process(event) || res;
            }
        }

        return processed && res;
    }
}

/**
 * A multi-touch user interaction.
 * A multi-touch starts when all its touches have started.
 * A multi-touch ends when the number of required touches is greater than the number of touches.
 */
export class MultiTouch extends ConcurrentInteraction<MultiTouchData, MultiTouchDataImpl, MultiTouchFSM> {
    /**
     * Creates the multi-touch interaction
     * @param nbTouches - The number of touches.
     * @param strict - Defines whether too many touches than expected cancelled the ongoing interaction
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(nbTouches: number, strict: boolean, logger: Logger, name?: string) {
        const handler: TouchDnDFSMHandler = {
            "onTouch": (event: TouchEvent): void => {
                const all = Array.from(event.touches);
                for (const t of Array.from(event.changedTouches)) {
                    const data = new SrcTgtTouchDataImpl();
                    data.copySrc(t, event, all);
                    data.copyTgt(t, event, all);
                    this._data.addTouchData(data);
                }
            },
            "onMove": (event: TouchEvent): void => {
                for (const t of Array.from(event.changedTouches)) {
                    this._data.setTouch(t, event);
                }
            },

            "onRelease": (event: TouchEvent): void => {
                for (const t of Array.from(event.changedTouches)) {
                    this._data.setTouch(t, event);
                }
            },

            "reinitData": (): void => {
                const currentIDs = new Set(this.fsm.conccurFSMs
                    .filter(fsm => fsm.started)
                    .map(fsm => fsm.getTouchId()));

                this.data
                    .touches
                    .filter(data => !currentIDs.has(data.src.identifier))
                    // eslint-disable-next-line unicorn/no-array-for-each
                    .forEach(data => {
                        (this.data as MultiTouchDataImpl).removeTouchData(data.src.identifier);
                    });
            }
        };

        super(new MultiTouchFSM(nbTouches, strict, logger, handler), new MultiTouchDataImpl(), logger, name ?? MultiTouch.name);
    }
}
