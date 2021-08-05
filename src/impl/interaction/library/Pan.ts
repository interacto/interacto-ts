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
import {MultiTouchDataImpl} from "../MultiTouchDataImpl";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {PanTouchFSMHandler} from "./PanTouch";
import {PanTouchFSM} from "./PanTouch";

/**
 * The FSM that defines a pan interaction.
 * A Pan is composed of one or more Pan Touches, depending on how many are required by the binder.
 */
class PanFSM extends ConcurrentFSM<PanTouchFSM> {
    /**
     * Creates the FSM.
     */
    public constructor(horizontal: boolean, minLength: number, nbTouches: number) {
        super([...Array(nbTouches).keys()].map(_ => new PanTouchFSM(horizontal, minLength)));
    }

    public override buildFSM(dataHandler: PanTouchFSMHandler): void {
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
 * A pan user interaction.
 * A pan starts when all its touches have started.
 * A pan ends when the number of current touches becomes lower than the number of required touches.
 * It is cancelled if the touches are not horizontal or vertical enough, and if the minimum required distance has not been covered at the end.
 */
export class Pan extends ConcurrentInteraction<MultiTouchData, MultiTouchDataImpl, PanFSM> {
    private readonly handler: PanTouchFSMHandler;

    /**
     * Creates the pinch interaction
     */
    public constructor(horizontal: boolean, minLength: number, nbTouches: number, pxTolerance: number) {
        super(new PanFSM(horizontal, minLength, nbTouches), new MultiTouchDataImpl());

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
            },
            "isHorizontal": (): boolean => this._data.isHorizontal(pxTolerance),
            "isVertical": (): boolean => this._data.isVertical(pxTolerance),
            "getDiffX": (id: number | undefined): number => {
                const res = this.data.touches.find(data => data.src.identifier === id);
                if (res !== undefined) {
                    return res.diffScreenX;
                }
                return 0;
            },
            "getDiffY": (id: number | undefined): number => {
                const res = this.data.touches.find(data => data.src.identifier === id);
                if (res !== undefined) {
                    return res.diffScreenY;
                }
                return 0;
            }
        };

        this.fsm.buildFSM(this.handler);
    }
}
