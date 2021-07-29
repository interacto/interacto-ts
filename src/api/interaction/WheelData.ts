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

import type {PointData} from "./PointData";

/**
 * Interaction data for a single pointing device with buttons and a wheel at a single position.
 * See: {@link https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent} (documentation extracted from here)
 */

export interface WheelData extends PointData {

    /**
     * Returns a double representing the horizontal scroll amount.
     */
    readonly deltaX: number;

    /**
     * Returns a double representing the vertical scroll amount.
     */
    readonly deltaY: number;

    /**
     * Returns a double representing the scroll amount for the z-axis.
     */
    readonly deltaZ: number;

    /**
     * Returns an unsigned long representing the unit of the delta* values' scroll amount.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode}
     */
    readonly deltaMode: number;
}
