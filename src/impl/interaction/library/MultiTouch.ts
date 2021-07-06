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

/**
 * The FSM that defines a multi-touch interaction (that works like a DnD)
 */
class MultiTouchFSM extends ConcurrentFSM<TouchDnDFSM> {
    /**
     * Creates the FSM.
     */
    public constructor(nbTouch: number) {
        super([...Array(nbTouch).keys()].map(_ => new TouchDnDFSM()));
    }

    public override buildFSM(dataHandler: TouchDnDFSMHandler): void {
        super.buildFSM(dataHandler);
        this.getConccurFSMs().forEach(fsm => {
            fsm.buildFSM(dataHandler);
        });
    }

    public override process(event: Event): boolean {
        if (!(event instanceof TouchEvent)) {
            return false;
        }

        const touches = this.getConccurFSMs()
            .filter(fsm => fsm.getTouchId() === event.changedTouches[0].identifier);

        if (touches.length > 0) {
            return touches[0].process(event);
        }

        return this.getConccurFSMs().some(conccurFSM => conccurFSM.process(event));
    }
}

/**
 * A multi-touch user interaction.
 * A multi-touch starts when all its touches have started.
 * A multi-touch ends when the number of required touches is greater than the number of touches.
 */
export class MultiTouch extends ConcurrentInteraction<MultiTouchData, MultiTouchDataImpl, MultiTouchFSM> {
    private readonly handler: TouchDnDFSMHandler;

    /**
     * Creates the multi-touch interaction
     * @param nbTouches - The number of touches.
     */
    public constructor(nbTouches: number) {
        super(new MultiTouchFSM(nbTouches), new MultiTouchDataImpl());

        this.handler = {
            "onTouch": (event: TouchEvent): void => {
                if (event.changedTouches.length > 0) {
                    const data = new SrcTgtTouchDataImpl();
                    data.copySrc(event.changedTouches[0], event);
                    data.copyTgt(event.changedTouches[0], event);
                    this._data.addTouchData(data);
                }
            },
            "onMove": (event: TouchEvent): void => {
                this._data.setTouch(event.changedTouches[0], event);
            },

            "onRelease": (event: TouchEvent): void => {
                this._data.setTouch(event.changedTouches[0], event);
            },

            "reinitData": (): void => {
                const currentIDs = this.fsm.getConccurFSMs()
                    .filter(fsm => fsm.started)
                    .map(fsm => fsm.getTouchId());

                this.data
                    .touches
                    .filter(data => !currentIDs.includes(data.src.identifier))
                    .forEach(data => {
                        (this.data as MultiTouchDataImpl).removeTouchData(data.src.identifier);
                    });
            }
        };

        this.fsm.buildFSM(this.handler);
    }
}
