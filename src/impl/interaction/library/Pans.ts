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

import {TouchDnD} from "./TouchDnD";
import {InteractionBuilderImpl} from "../InteractionBuilderImpl";
import type {Logger} from "../../../api/logging/Logger";

/**
 * Creates the horizontal pan (or a swipe if minVelocity is used).
 * @param logger - The logger to use for this interaction
 * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
 * @param pxTolerance - The pixel tolerance for considering the line horizontal.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @returns The supplier that will produce the interaction when called
 */
export function hPan(logger: Logger, cancellable: boolean,
                     pxTolerance: number, minLength?: number, minVelocity?: number): () => TouchDnD {
    return new InteractionBuilderImpl(name => new TouchDnD(logger, cancellable, undefined, name))
        .firstAndThen(data => data.isHorizontal(pxTolerance))
        .end(data => (minLength === undefined || Math.abs(data.diffScreenX) >= minLength) &&
            (minVelocity === undefined || data.velocity("horiz") >= minVelocity))
        .name(hPan.name)
        .build();
}

/**
 * Creates the vertical pan (or a swipe if minVelocity is used).
 * @param logger - The logger to use for this interaction
 * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
 * @param pxTolerance - The pixel tolerance for considering the line vertical.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @returns The supplier that will produce the interaction when called
 */
export function vPan(logger: Logger, cancellable: boolean,
                     pxTolerance: number, minLength?: number, minVelocity?: number): () => TouchDnD {
    return new InteractionBuilderImpl(name => new TouchDnD(logger, cancellable, undefined, name))
        .firstAndThen(data => data.isVertical(pxTolerance))
        .end(data => (minLength === undefined || Math.abs(data.diffScreenY) >= minLength) &&
                    (minVelocity === undefined || data.velocity("vert") >= minVelocity))
        .name(vPan.name)
        .build();
}

/**
 * Creates a left pan (or a swipe if minVelocity is used).
 * @param logger - The logger to use for this interaction
 * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
 * @param pxTolerance - The pixel tolerance for considering the line to the left.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @returns The supplier that will produce the interaction when called
 */
export function leftPan(logger: Logger, cancellable: boolean,
                        pxTolerance: number, minLength?: number, minVelocity?: number): () => TouchDnD {
    return new InteractionBuilderImpl(name => new TouchDnD(logger, cancellable, undefined, name))
        .firstAndThen(data => data.isLeft(pxTolerance))
        .end(data => (minLength === undefined || Math.abs(data.diffScreenX) >= minLength) &&
                    (minVelocity === undefined || data.velocity("horiz") >= minVelocity))
        .name(leftPan.name)
        .build();
}

/**
 * Creates a right pan (or a swipe if minVelocity is used).
 * @param logger - The logger to use for this interaction
 * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
 * @param pxTolerance - The pixel tolerance for considering the line to the right.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @returns The supplier that will produce the interaction when called
 */
export function rightPan(logger: Logger, cancellable: boolean,
                         pxTolerance: number, minLength?: number, minVelocity?: number): () => TouchDnD {
    return new InteractionBuilderImpl(name => new TouchDnD(logger, cancellable, undefined, name))
        .firstAndThen(data => data.isRight(pxTolerance))
        .end(data => (minLength === undefined || Math.abs(data.diffScreenX) >= minLength) &&
                    (minVelocity === undefined || data.velocity("horiz") >= minVelocity))
        .name(rightPan.name)
        .build();
}

/**
 * Creates a top pan (or a swipe if minVelocity is used).
 * @param logger - The logger to use for this interaction
 * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
 * @param pxTolerance - The pixel tolerance for considering the line to the top.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @returns The supplier that will produce the interaction when called
 */
export function topPan(logger: Logger, cancellable: boolean,
                       pxTolerance: number, minLength?: number, minVelocity?: number): () => TouchDnD {
    return new InteractionBuilderImpl(name => new TouchDnD(logger, cancellable, undefined, name))
        .firstAndThen(data => data.isTop(pxTolerance))
        .end(data => (minLength === undefined || Math.abs(data.diffScreenY) >= minLength) &&
                    (minVelocity === undefined || data.velocity("vert") >= minVelocity))
        .name(topPan.name)
        .build();
}

/**
 * Creates a bottom pan (or a swipe if minVelocity is used).
 * @param logger - The logger to use for this interaction
 * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
 * @param pxTolerance - The pixel tolerance for considering the line to the bottom.
 * @param minLength - The minimal distance from the starting point to the release point for validating the pan
 * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @returns The supplier that will produce the interaction when called
 */
export function bottomPan(logger: Logger, cancellable: boolean,
                          pxTolerance: number, minLength?: number, minVelocity?: number): () => TouchDnD {
    return new InteractionBuilderImpl(name => new TouchDnD(logger, cancellable, undefined, name))
        .firstAndThen(data => data.isBottom(pxTolerance))
        .end(data => (minLength === undefined || Math.abs(data.diffScreenY) >= minLength) &&
                    (minVelocity === undefined || data.velocity("vert") >= minVelocity))
        .name(bottomPan.name)
        .build();
}
