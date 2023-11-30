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

import type {LineTouchData} from "./LineTouchData";
import type {MultiTouchData} from "./MultiTouchData";
import type {RotationData} from "./RotationTouchData";
import type {SrcTgtPointsData} from "./SrcTgtPointsData";
import type {TouchData} from "./TouchData";

/**
 * The commun type for all two touch interaction data.
 */
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
     * The translation vector between the x client position of the source and the y client position of the target.
     */
    readonly diffClientX: number;

    /**
    * The translation vector between the y client position of the source and the y client position of the target.
    */
    readonly diffClientY: number;

    /**
    * The translation vector between the x page position of the source and the x page position of the target.
    */
    readonly diffPageX: number;

    /**
    * The translation vector between the y page position of the source and the y page position of the target.
    */
    readonly diffPageY: number;

    /**
    * The translation vector between the x screen position of the source and the x screen position of the target.
    */
    readonly diffScreenX: number;

    /**
    * The translation vector between the y screen position of the source and the y screen position of the target.
    */
    readonly diffScreenY: number;

    /**
     * Returns the distance between the end position of the touches divided the distance between the starting position of the touches.
     * If more or less than two touches are involved, or if the touches do not get closer during the interaction or follow the same line,
     * the method returns undefined.
     * @param pxTolerance - The pixel tolerance for considering that the two touches are moving on the same line.
     */
    pinchFactor(pxTolerance: number): number | undefined;
}

/**
 * A two touch interaction type that encompasses all the possible two touch interaction data.
 */
export type GeneralTwoTouchData = LineTouchData & RotationData;
