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

import {ConcurrentFSM} from "../../fsm/ConcurrentFSM";
import {ConcurrentInteraction} from "../ConcurrentInteraction";
import type {MultiTouchData} from "../../../api/interaction/MultiTouchData";
import type {TouchDnDFSMHandler} from "./TouchDnD";
import {TouchDnDFSM} from "./TouchDnD";
import {MultiTouchDataImpl} from "../MultiTouchDataImpl";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {Logger} from "../../../api/logging/Logger";

/**
 * The FSM that defines a multi-touch interaction (that works like a DnD)
 */
class MultiTouchFSM extends ConcurrentFSM<TouchDnDFSM, TouchDnDFSMHandler> {
    /**
     * Creates the FSM.
     */
    public constructor(nbTouch: number, totalReinit: boolean, logger: Logger, dataHandler: TouchDnDFSMHandler) {
        super([...Array.from({"length": nbTouch}).keys()].map(_ => new TouchDnDFSM(false, logger, dataHandler, false)),
            logger, totalReinit ? [new TouchDnDFSM(false, logger, dataHandler, false)] : [], totalReinit, dataHandler);
    }

    public override process(event: Event): boolean {
        if (!(event instanceof TouchEvent)) {
            return false;
        }

        let processed = false;
        let res = false;

        // checking lost touch event
        if (event.type === "touchstart") {
            const ids = new Set([...event.touches].map(touch => touch.identifier));
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
            const touches: Array<TouchDnDFSM> = this.conccurFSMs
                .filter(fsm => fsm.getTouchId() === event.changedTouches[i].identifier);
            if (touches.length > 0) {
                processed = true;
                res = touches[0].process(event) || res;
            } else {
                // If no FSM found, two meanings:
                // 1/ the touch event is unexpected since all the FSMs are running, so cancelling
                const remainingFSMs = this.conccurFSMs.filter(fsm => fsm.getTouchId() === undefined);
                if (remainingFSMs.length === 0) {
                    this.onCancelling();
                    res = false;
                } else {
                    // 2/ There exists an FSM that is free to process the new touch
                    res = remainingFSMs[0].process(event) || res;
                }
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
     */
    public constructor(nbTouches: number, strict: boolean, logger: Logger) {
        const handler: TouchDnDFSMHandler = {
            "onTouch": (event: TouchEvent): void => {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const data = new SrcTgtTouchDataImpl();
                    const all = [...event.touches];
                    data.copySrc(event.changedTouches[i], event, all);
                    data.copyTgt(event.changedTouches[i], event, all);
                    this._data.addTouchData(data);
                }
            },
            "onMove": (event: TouchEvent): void => {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < event.changedTouches.length; i++) {
                    this._data.setTouch(event.changedTouches[i], event);
                }
            },

            "onRelease": (event: TouchEvent): void => {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < event.changedTouches.length; i++) {
                    this._data.setTouch(event.changedTouches[i], event);
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

        super(new MultiTouchFSM(nbTouches, strict, logger, handler), new MultiTouchDataImpl(), logger);
    }
}
