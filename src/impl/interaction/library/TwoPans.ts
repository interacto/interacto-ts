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

import {XTouchDnD} from "./XTouch";
import {InteractionBuilderImpl} from "../InteractionBuilderImpl";
import {TwoPanDataImpl} from "../TwoPanDataImpl";
import type {LineTouchData} from "../../../api/interaction/LineTouchData";
import type {TwoTouchData} from "../../../api/interaction/TwoTouchData";
import type {Logger} from "../../../api/logging/Logger";

export type TwoPan = XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>;

/**
 * Creates the horizontal pan that uses two touches.
 * @param logger - The logger to use for this interaction
 * @param pxTolerance - The pixel tolerance for considering the line horizontal.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @returns The supplier that will produce the interaction when called
 */
export function twoHPan(logger: Logger, pxTolerance: number, minLength?: number): () => TwoPan {
    return new InteractionBuilderImpl(name => new XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>(2, logger,
        new TwoPanDataImpl(), name, undefined, true))
        .firstAndThen(data => data.isHorizontal(pxTolerance))
        .end(data => minLength === undefined || Math.abs(data.diffScreenX) >= minLength)
        .name(twoHPan.name)
        .build();
}

/**
 * Creates the vertical pan that uses two touches.
 * @param logger - The logger to use for this interaction
 * @param pxTolerance - The pixel tolerance for considering the line vertical.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @returns The supplier that will produce the interaction when called
 */
export function twoVPan(logger: Logger, pxTolerance: number, minLength?: number): () => TwoPan {
    return new InteractionBuilderImpl(name => new XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>(2, logger,
        new TwoPanDataImpl(), name, undefined, true))
        .firstAndThen(data => data.isVertical(pxTolerance))
        .end(data => minLength === undefined || Math.abs(data.diffScreenY) >= minLength)
        .name(twoVPan.name)
        .build();
}

/**
 * Creates a left pan that uses two touches.
 * @param logger - The logger to use for this interaction
 * @param pxTolerance - The pixel tolerance for considering the line to the left.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @returns The supplier that will produce the interaction when called
 */
export function twoLeftPan(logger: Logger, pxTolerance: number, minLength?: number): () => TwoPan {
    return new InteractionBuilderImpl(name => new XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>(2, logger,
        new TwoPanDataImpl(), name, undefined, true))
        .firstAndThen(data => data.isLeft(pxTolerance))
        .end(data => minLength === undefined || Math.abs(data.diffScreenX) >= minLength)
        .name(twoLeftPan.name)
        .build();
}

/**
 * Creates a right pan that uses two touches.
 * @param logger - The logger to use for this interaction
 * @param pxTolerance - The pixel tolerance for considering the line to the right.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @returns The supplier that will produce the interaction when called
 */
export function twoRightPan(logger: Logger, pxTolerance: number, minLength?: number): () => TwoPan {
    return new InteractionBuilderImpl(name => new XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>(2, logger,
        new TwoPanDataImpl(), name, undefined, true))
        .firstAndThen(data => data.isRight(pxTolerance))
        .end(data => minLength === undefined || Math.abs(data.diffScreenX) >= minLength)
        .name(twoRightPan.name)
        .build();
}

/**
 * Creates a top pan that uses two touches.
 * @param logger - The logger to use for this interaction
 * @param pxTolerance - The pixel tolerance for considering the line to the top.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @returns The supplier that will produce the interaction when called
 */
export function twoTopPan(logger: Logger, pxTolerance: number, minLength?: number): () => TwoPan {
    return new InteractionBuilderImpl(name => new XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>(2, logger,
        new TwoPanDataImpl(), name, undefined, true))
        .firstAndThen(data => data.isTop(pxTolerance))
        .end(data => minLength === undefined || Math.abs(data.diffScreenY) >= minLength)
        .name(twoTopPan.name)
        .build();
}

/**
 * Creates a bottom pan that uses two touches.
 * @param logger - The logger to use for this interaction
 * @param pxTolerance - The pixel tolerance for considering the line to the bottom.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @returns The supplier that will produce the interaction when called
 */
export function twoBottomPan(logger: Logger, pxTolerance: number, minLength?: number): () => TwoPan {
    return new InteractionBuilderImpl(name => new XTouchDnD<LineTouchData & TwoTouchData, TwoPanDataImpl>(2, logger,
        new TwoPanDataImpl(), name, undefined, true))
        .firstAndThen(data => data.isBottom(pxTolerance))
        .end(data => minLength === undefined || Math.abs(data.diffScreenY) >= minLength)
        .name(twoBottomPan.name)
        .build();
}
