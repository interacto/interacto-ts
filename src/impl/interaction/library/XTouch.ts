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

import type {FourTouchData} from "../../../api/interaction/FourTouchData";
import type {ThreeTouchData} from "../../../api/interaction/ThreeTouchData";
import type {TwoTouchData} from "../../../api/interaction/TwoTouchData";
import type {Logger} from "../../../api/logging/Logger";
import {ConcurrentInteraction} from "../ConcurrentInteraction";
import {FourTouchDataImpl} from "../FourTouchDataImpl";
import {ThreeTouchDataImpl} from "../ThreeTouchDataImpl";
import {TwoTouchDataImpl} from "../TwoTouchDataImpl";
import {MultiTouchFSM} from "./MultiTouch";
import type {TouchDnDFSMHandler} from "./TouchDnD";

export abstract class XTouchDnD<T extends TwoTouchData, S extends T & TwoTouchDataImpl> extends ConcurrentInteraction<T, S, MultiTouchFSM> {
    /**
     * Creates the interaction.
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(nbTouches: number, logger: Logger, dataImpl: S, name: string, fsm?: MultiTouchFSM) {
        //    predicate?: (data: SrcTgtPointsData<TouchData>) => boolean,
        //    predicateEnd?: (data: SrcTgtPointsData<TouchData>) => boolean) {
        const handler: TouchDnDFSMHandler = {
            "onTouch": (evt: TouchEvent): void => {
                const all = Array.from(evt.touches);
                for (const t of Array.from(evt.changedTouches)) {
                    this._data.initTouch(t, evt, all);
                }
            },
            "onMove": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "onRelease": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(fsm ?? new MultiTouchFSM(nbTouches, true, logger, handler), dataImpl, logger, name);
    }

    protected setTgtData(evt: TouchEvent): void {
        const all = Array.from(evt.touches);
        for (const t of Array.from(evt.changedTouches)) {
            this._data.copyTouch(t, evt, all);
        }
    }
}

/**
 * A touch interaction that involves two touches exactly.
 */
export class TwoTouchDnD extends XTouchDnD<TwoTouchData, TwoTouchDataImpl> {
    public constructor(logger: Logger) {
        super(2, logger, new TwoTouchDataImpl(), TwoTouchDnD.name);
    }
}

/**
 * A touch interaction that involves three touches exactly.
 */
export class ThreeTouchDnD extends XTouchDnD<ThreeTouchData, ThreeTouchDataImpl> {
    public constructor(logger: Logger) {
        super(3, logger, new ThreeTouchDataImpl(), ThreeTouchDnD.name);
    }
}

/**
 * A touch interaction that involves four touches exactly.
 */
export class FourTouchDnD extends XTouchDnD<FourTouchData, FourTouchDataImpl> {
    public constructor(logger: Logger) {
        super(4, logger, new FourTouchDataImpl(), FourTouchDnD.name);
    }
}
