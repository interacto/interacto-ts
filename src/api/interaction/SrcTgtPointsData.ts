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

import {PointData} from "./PointData";

/**
 * Interaction data for a single pointing device that moves from a source
 * position to a target position.
 */
export interface SrcTgtPointsData extends PointData {
    /**
     * @returns The object picked at the target location.
     */
    getTgtObject(): EventTarget | undefined;

    /**
     * @returns The last X-client position.
     */
    getTgtClientX(): number;

    /**
     * @returns The last Y-client position.
     */
    getTgtClientY(): number;

    /**
     * @returns The last X-screen position.
     */
    getTgtScreenX(): number;

    /**
     * @returns The last Y-screen position.
     */
    getTgtScreenY(): number;
}
