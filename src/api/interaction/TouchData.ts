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

import {UnitInteractionData} from "./UnitInteractionData";
import {PointBaseData} from "./PointBaseData";

/**
 * The touch interaction data interface
 * See https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent and
 * https://developer.mozilla.org/en-US/docs/Web/API/Touch
 * (documentation extracted from there)
 */
export interface TouchData extends PointBaseData, UnitInteractionData {
    readonly altitudeAngle: number;

    readonly azimuthAngle: number;

    /**
     * The amount of pressure being applied to the surface by the user,
     * as a float between 0.0 (no pressure) and 1.0 (maximum pressure).
     */
    readonly force: number;

    /**
     * A unique identifier for the implied touch object.
     */
    readonly identifier: number;

    /**
     * The X coordinate of the touch point relative to the left edge of the document.
     * Unlike clientX, this value includes the horizontal scroll offset, if any.
     */
    readonly pageX: number;

    /**
     * The Y coordinate of the touch point relative to the top of the document.
     * Unlike clientY, this value includes the vertical scroll offset, if any.
     */
    readonly pageY: number;

    /**
     * The X radius of the ellipse that most closely circumscribes the area of contact with the screen.
     * The value is in pixels of the same scale as screenX.
     */
    readonly radiusX: number;

    /**
     * The Y radius of the ellipse that most closely circumscribes the area of contact with the screen.
     * The value is in pixels of the same scale as screenY.
     */
    readonly radiusY: number;

    /**
     * The angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise,
     * to most accurately cover the area of contact between the user and the surface.
     */
    readonly rotationAngle: number;

    readonly touchType: TouchType;
}
