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

import type {PointBaseData} from "./PointBaseData";

/**
 * Interaction data for a single pointing device that moves from a source
 * position to a target position.
 * @category API Interaction Data
 */
export interface SrcTgtPointsData<T extends PointBaseData> {
    /**
     * The source point data.
     */
    readonly src: T;

    /**
     * The target point data.
     * At the beginning of the interaction, the target data have the same values
     * as the source data.
     */
    readonly tgt: T;

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
     * The duration of the move, in milliseconds.
     */
    readonly duration: number;

    /**
     * The velocity of the move, in pixels per millisecond.
     * @param direction - The direciton to consider.
     */
    velocity(direction: "all" | "horiz" | "vert"): number;

    /**
     * Returns true if the line between the two points is relatively vertical.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     */
    isVertical(pxTolerance: number): boolean;

    /**
     * Returns true if the line between the two points is relatively horizontal.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    isHorizontal(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture is going to the left.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    isLeft(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture is going to the right.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    isRight(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture is going to the top.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     */
    isTop(pxTolerance: number): boolean;

    /**
     * Returns true if the gesture is going to the bottom.
     * @param pxTolerance - The pixel tolerance for considering the line vertical.
     */
    isBottom(pxTolerance: number): boolean;
}
