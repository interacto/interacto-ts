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

import type {Logger} from "../../../api/logging/Logger";
import type {OneTouchDnDFSM} from "./TouchDnD";
import {TouchDnD} from "./TouchDnD";

export class HPan extends TouchDnD {
    /**
     * Creates the horizontal pan.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(logger: Logger, cancellable: boolean, pxTolerance: number, minLength?: number, fsm?: OneTouchDnDFSM) {
        super(logger, cancellable, fsm,
            data => data.isHorizontal(pxTolerance),
            data => minLength === undefined || Math.abs(data.diffScreenX) >= minLength);
    }
}

export class VPan extends TouchDnD {
    /**
     * Creates the vertical pan.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(logger: Logger, cancellable: boolean, pxTolerance: number, minLength?: number, fsm?: OneTouchDnDFSM) {
        super(logger, cancellable, fsm,
            data => data.isVertical(pxTolerance),
            data => minLength === undefined || Math.abs(data.diffScreenY) >= minLength);
    }
}

export class LeftPan extends TouchDnD {
    /**
     * Creates a left pan.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param pxTolerance - The pixel tolerance for considering the line to the left.
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(logger: Logger, cancellable: boolean, pxTolerance: number, minLength?: number, fsm?: OneTouchDnDFSM) {
        super(logger, cancellable, fsm,
            data => data.isLeft(pxTolerance),
            data => minLength === undefined || Math.abs(data.diffScreenX) >= minLength);
    }
}

export class RightPan extends TouchDnD {
    /**
     * Creates a right pan.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param pxTolerance - The pixel tolerance for considering the line to the right.
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(logger: Logger, cancellable: boolean, pxTolerance: number, minLength?: number, fsm?: OneTouchDnDFSM) {
        super(logger, cancellable, fsm,
            data => data.isRight(pxTolerance),
            data => minLength === undefined || Math.abs(data.diffScreenX) >= minLength);
    }
}

export class TopPan extends TouchDnD {
    /**
     * Creates a top pan.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param pxTolerance - The pixel tolerance for considering the line to the top.
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(logger: Logger, cancellable: boolean, pxTolerance: number, minLength?: number, fsm?: OneTouchDnDFSM) {
        super(logger, cancellable, fsm,
            data => data.isTop(pxTolerance),
            data => minLength === undefined || Math.abs(data.diffScreenY) >= minLength);
    }
}

export class BottomPan extends TouchDnD {
    /**
     * Creates a bottom pan.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     * @param pxTolerance - The pixel tolerance for considering the line to the bottom.
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param fsm - The optional FSM provided for the interaction
     */
    public constructor(logger: Logger, cancellable: boolean, pxTolerance: number, minLength?: number, fsm?: OneTouchDnDFSM) {
        super(logger, cancellable, fsm,
            data => data.isBottom(pxTolerance),
            data => minLength === undefined || Math.abs(data.diffScreenY) >= minLength);
    }
}
