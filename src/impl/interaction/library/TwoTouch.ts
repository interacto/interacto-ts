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

import type {RotationData} from "../../../api/interaction/RotationTouchData";
import type {Logger} from "../../../api/logging/Logger";
import {InteractionBuilderImpl} from "../InteractionBuilderImpl";
import {RotationDataImpl} from "../RotationDataImpl";
import {XTouchDnD} from "./XTouch";

/**
 * Define a type for touch interactions performing a rotation.
 */
export type Rotate = XTouchDnD<RotationData, RotationDataImpl>;

/**
 * Creates a touch-based rotation interaction (two-touch).
 * @param pxTolerance - The pixel tolerance for considering the rotation (tolerance while moving the fixation point).
 */
export function rotate(logger: Logger, pxTolerance: number): () => Rotate {
    return new InteractionBuilderImpl(name => new XTouchDnD<RotationData, RotationDataImpl>(2, logger,
        new RotationDataImpl(), name, undefined, true))
        .then(data => data.touch1.diffClientX < pxTolerance && data.touch1.diffClientY < pxTolerance)
        .name(rotate.name)
        .build();
}
