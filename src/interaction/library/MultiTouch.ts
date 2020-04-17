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
import {MultiTouchData, MultiTouchDataImpl} from "./MultiTouchData";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchData";
import {TouchDnDFSM, TouchDnDFSMHandler} from "./TouchDnD";

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
        this.getConccurFSMs().forEach(fsm => fsm.buildFSM(dataHandler));
    }

    public process(event: Event): boolean {
        if(!(event instanceof TouchEvent)) {
            return false;
        }

        const touch = this.getConccurFSMs()
            .filter(fsm => fsm.getTouchId() === event.changedTouches[0].identifier)[0];

        if(touch !== undefined) {
            return touch.process(event);
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
	 * @param nbTouches The number of touches.
	 */
    public constructor(nbTouches: number) {
        super(new MultiTouchFSM(nbTouches));

        this.handler = new class implements TouchDnDFSMHandler {
            private readonly parent: MultiTouch;

            public constructor(parent: MultiTouch) {
                this.parent = parent;
            }

            public onTouch(event: TouchEvent): void {
                const touch = event.changedTouches[0];
                if(touch !== undefined) {
                    (this.parent.data as (MultiTouchDataImpl)).addTouchData(
                        new SrcTgtTouchDataImpl(touch.identifier, touch.clientX, touch.clientY, touch.screenX, touch.screenY, touch.target));
                }
            }

            public onMove(event: TouchEvent): void {
                (this.parent.data as MultiTouchDataImpl).setTouch(event.changedTouches[0]);
            }

            public onRelease(event: TouchEvent): void {
                (this.parent.data as MultiTouchDataImpl).setTouch(event.changedTouches[0]);
            }

            public reinitData(): void {
                const currentIDs = this.parent.getFsm().getConccurFSMs()
                    .filter(fsm => fsm.isStarted())
                    .map(fsm => fsm.getTouchId());

                this.parent.getData()
                    .getTouchData()
                    .filter(data => !currentIDs.includes(data.getTouchId()))
                    .forEach(data => (this.parent.getData() as MultiTouchDataImpl)
                        .removeTouchData(data.getTouchId() as number));
            }
        }(this);

        this.fsm.buildFSM(this.handler);
    }

    protected createDataObject(): MultiTouchData {
        return new MultiTouchDataImpl();
    }
}
