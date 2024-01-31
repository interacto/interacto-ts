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
import type {SrcTgtPointsData} from "./SrcTgtPointsData";
import type {TouchData} from "./TouchData";

/**
 * Multi-touch interaction data interface
 * @category API Interaction Data
 */
export interface MultiTouchData extends InteractionData {
    /**
     * The list of touch data.
     */
    readonly touches: ReadonlyArray<SrcTgtPointsData<TouchData>>;

    /**
     * The velocity of the move, in pixels per millisecond.
     * For multi-touch, the velocity is the mean of all the touch velocities.
     * @param direction - The direciton to consider.
     */
    velocity(direction: "all" | "horiz" | "vert"): number;
}
