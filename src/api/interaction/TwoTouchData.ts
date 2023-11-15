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

import type {MultiTouchData} from "./MultiTouchData";
import type {SrcTgtPointsData} from "./SrcTgtPointsData";
import type {TouchData} from "./TouchData";

export interface TwoTouchData extends MultiTouchData {
    /**
     * The first touch
     */
    readonly touch1: SrcTgtPointsData<TouchData>;

    /**
     * The second touch
     */
    readonly touch2: SrcTgtPointsData<TouchData>;

    /**
     * Returns true if all the touch lines are vertical in the same direction.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     */
    isVertical(pxTolerance: number): boolean;

    /**
     * Returns true if all the touch lines are horizontal in the same direction.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    isHorizontal(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture (all the lines) is going to the left.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    isLeft(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture (all the lines) is going to the right.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    isRight(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture (all the lines) is going to the top.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     */
    isTop(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture (all the lines) is going to the bottom.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     */
    isBottom(pxTolerance: number): boolean;

    /**
     * Returns the distance between the end position of the touches divided the distance between the starting position of the touches.
     * If more or less than two touches are involved, or if the touches do not get closer during the interaction or follow the same line,
     * the method returns undefined.
     * @param pxTolerance - The pixel tolerance for considering that the two touches are moving on the same line.
     */
    pinchFactor(pxTolerance: number): number | undefined;
}
