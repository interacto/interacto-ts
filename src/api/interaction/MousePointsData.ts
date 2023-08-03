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
import type {PointsData} from "./PointsData";

/**
 * Mouse interaction data that contains a set of points and the current position of the mouse.
 */
export interface MousePointsData extends PointsData<PointData> {
    /**
     * @returns The current position of the pointing device.
     */
    readonly currentPosition: PointData | undefined;
}
