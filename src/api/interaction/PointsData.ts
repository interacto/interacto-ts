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

import type {InteractionData} from "./InteractionData";
import type {PointData} from "./PointData";

/**
 * Interaction data that contains a set of points.
 */
export interface PointsData extends InteractionData {
    /**
     * @returns The series of points.
     */
    readonly points: ReadonlyArray<PointData>;

    /**
     * @returns The current position of the pointing device.
     */
    readonly currentPosition: PointData | undefined;

    /**
     * @returns The last button used to produce the points.
     */
    readonly lastButton: number | undefined;
}
