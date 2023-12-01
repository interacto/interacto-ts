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

import {MultiTouchFSM} from "./MultiTouch";
import {ConcurrentInteraction} from "../ConcurrentInteraction";
import {FourTouchDataImpl} from "../FourTouchDataImpl";
import {GeneralTwoTouchDataImpl} from "../GeneralTwoTouchDataImpl";
import {InteractionBuilderImpl} from "../InteractionBuilderImpl";
import {ThreeTouchDataImpl} from "../ThreeTouchDataImpl";
import type {TouchDnDFSMHandler} from "./TouchDnD";
import type {FourTouchData} from "../../../api/interaction/FourTouchData";
import type {ThreeTouchData} from "../../../api/interaction/ThreeTouchData";
import type {GeneralTwoTouchData, TwoTouchData} from "../../../api/interaction/TwoTouchData";
import type {Logger} from "../../../api/logging/Logger";
import type {TwoTouchDataImpl} from "../TwoTouchDataImpl";

/**
 * The X-touch represents any touch interaction that involve more than one touch.
 * This class is usually used to build more complex touch interactions.
 */
export class XTouchDnD<T extends TwoTouchData, S extends T & TwoTouchDataImpl> extends ConcurrentInteraction<T, S, MultiTouchFSM> {
    /**
     * Creates the interaction.
     * @param fsm - The optional FSM provided for the interaction
     * @param movementRequired - Whether the DnD starts after the touch point has begun moving (default)
     * or as soon as the screen is touched. The latter is used for the MultiTouch interaction.
     */
    public constructor(nbTouches: number, logger: Logger, dataImpl: S, name?: string, fsm?: MultiTouchFSM, movementRequired?: boolean) {
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

        super(fsm ?? new MultiTouchFSM(nbTouches, true, logger, handler, movementRequired), dataImpl, logger, name ?? XTouchDnD.name);
    }

    protected setTgtData(evt: TouchEvent): void {
        const all = Array.from(evt.touches);
        for (const t of Array.from(evt.changedTouches)) {
            this._data.copyTouch(t, evt, all);
        }
    }
}

/**
 * A shortcut that defines a two-touch interactions.
 */
export type TwoTouch = XTouchDnD<GeneralTwoTouchData, GeneralTwoTouchDataImpl>;

/**
 * Creates a two-touch user interaction
 */
export function twoTouch(logger: Logger): () => TwoTouch {
    return new InteractionBuilderImpl(name => new XTouchDnD<GeneralTwoTouchData, GeneralTwoTouchDataImpl>(2, logger,
        new GeneralTwoTouchDataImpl(), name, undefined, false))
        .name(twoTouch.name)
        .build();
}

/**
 * A touch interaction that involves three touches exactly.
 */
export class ThreeTouchDnD extends XTouchDnD<ThreeTouchData, ThreeTouchDataImpl> {
    public constructor(logger: Logger, name?: string, movementRequired?: boolean) {
        super(3, logger, new ThreeTouchDataImpl(), name ?? ThreeTouchDnD.name, undefined, movementRequired);
    }
}

/**
 * A touch interaction that involves four touches exactly.
 */
export class FourTouchDnD extends XTouchDnD<FourTouchData, FourTouchDataImpl> {
    public constructor(logger: Logger, name?: string, movementRequired?: boolean) {
        super(4, logger, new FourTouchDataImpl(), name ?? FourTouchDnD.name, undefined, movementRequired);
    }
}
