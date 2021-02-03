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
import {MultiTouchData} from "../../../api/interaction/MultiTouchData";
import {TouchDnDFSM, TouchDnDFSMHandler} from "./TouchDnD";
import {MultiTouchDataImpl} from "./MultiTouchDataImpl";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";

/**
 * The FSM that defines a multi-touch interaction (that works like a DnD)
 */
export class MultiTouchFSM extends ConcurrentFSM<TouchDnDFSM> {
    /**
     * Creates the FSM.
     */
    public constructor(nbTouch: number) {
        super([...Array(nbTouch).keys()].map(_ => new TouchDnDFSM()));
    }

    public buildFSM(dataHandler: TouchDnDFSMHandler): void {
        super.buildFSM(dataHandler);
        this.getConccurFSMs().forEach(fsm => {
            fsm.buildFSM(dataHandler);
        });
    }

    public process(event: Event): boolean {
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
export class MultiTouch extends ConcurrentInteraction<MultiTouchData, MultiTouchFSM> {
    private readonly handler: TouchDnDFSMHandler;

    /**
     * Creates the multi-touch interaction
     * @param nbTouches - The number of touches.
     */
    public constructor(nbTouches: number) {
        super(new MultiTouchFSM(nbTouches));

        this.handler = {
            "onTouch": (event: TouchEvent): void => {
                if (event.changedTouches.length > 0) {
                    const touch = event.changedTouches[0];
                    (this.data as (MultiTouchDataImpl)).addTouchData(
                        new SrcTgtTouchDataImpl(touch.identifier, touch.clientX, touch.clientY, touch.screenX, touch.screenY, touch.target));
                }
            },
            "onMove": (event: TouchEvent): void => {
                (this.data as MultiTouchDataImpl).setTouch(event.changedTouches[0]);
            },

            "onRelease": (event: TouchEvent): void => {
                (this.data as MultiTouchDataImpl).setTouch(event.changedTouches[0]);
            },

            "reinitData": (): void => {
                const currentIDs = this.getFsm().getConccurFSMs()
                    .filter(fsm => fsm.isStarted())
                    .map(fsm => fsm.getTouchId());

                this.getData()
                    .getTouchData()
                    .filter(data => !currentIDs.includes(data.getTouchId()))
                    .forEach(data => {
                        (this.getData() as MultiTouchDataImpl).removeTouchData(data.getTouchId() ?? -1);
                    });
            }
        };

        this.fsm.buildFSM(this.handler);
    }

    protected createDataObject(): MultiTouchData {
        return new MultiTouchDataImpl();
    }
}
