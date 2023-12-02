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

import {TwoTouchDataImpl} from "./TwoTouchDataImpl";
import type {ScaleTouchData} from "../../api/interaction/ScaleTouchData";

/**
 * The implementation of the scale/pinch interaction data.
 */
export class ScaleTouchDataImpl extends TwoTouchDataImpl implements ScaleTouchData {
    public constructor() {
        super();
    }

    public scalingRatio(pxTolerance: number): number {
        // 1. Check that there are 2 touches
        const t0 = this.t1;
        const t1 = this.t2;

        if (t0.src.identifier === -1 || t1.src.identifier === -1) {
            return 0;
        }

        const tgt1: [number, number] = [t0.tgt.screenX, t0.tgt.screenY];
        const tgt2: [number, number] = [t1.tgt.screenX, t1.tgt.screenY];

        const src1: [number, number] = [t0.src.screenX, t0.src.screenY];
        const src2: [number, number] = [t1.src.screenX, t1.src.screenY];

        const vector1: [number, number] = [t0.diffScreenX, t0.diffScreenY];
        const vector2: [number, number] = [t1.diffScreenX, t1.diffScreenY];

        // 2. Define the line between the 2 sources
        const lineVector: [number, number] = [tgt2[0] - tgt1[0], tgt2[1] - tgt1[1]];

        // 3. For each touch, define the projection of the target on the line
        const projection1 = ScaleTouchDataImpl.project(vector1, lineVector);
        const projectionVector1: [number, number] = [projection1 * lineVector[0], projection1 * lineVector[1]];

        const projection2 = ScaleTouchDataImpl.project(vector2, lineVector);
        const projectionVector2: [number, number] = [projection2 * lineVector[0], projection2 * lineVector[1]];

        // 4. Check that the projections have opposite signs
        if (projection1 / Math.abs(projection1) === projection2 / Math.abs(projection2)) {
            return 0;
        }

        // 5. Calculate the distances between the targets and the projected points and check they are < pxTolerance
        const distance1 = ScaleTouchDataImpl.distance(projectionVector1, vector1);
        const distance2 = ScaleTouchDataImpl.distance(projectionVector2, vector2);

        if (distance1 > pxTolerance || distance2 > pxTolerance || Number.isNaN(distance1) || Number.isNaN(distance2)) {
            return 0;
        }

        /*
         * 6. Calculate the ratio between the distance between the end position of the touches
         * and the distance between the starting position of the touches
         */
        return ScaleTouchDataImpl.distance(tgt1, tgt2) / ScaleTouchDataImpl.distance(src1, src2);
    }

    /**
     * @param vector1 - The first vector of the projection
     * @param vector2 -The second vector of the projection
     * @returns The value of the projection of vector1 on vector2
     */
    public static project(vector1: [number, number], vector2: [number, number]): number {
        return (vector1[0] * vector2[0] + vector1[1] * vector2[1]) / (vector2[0] ** 2 + vector2[1] ** 2);
    }

    /**
     * @param point1 - The first point
     * @param point2 - The second point
     * @returns the distance between point1 and point2
     */
    public static distance(point1: [number, number], point2: [number, number]): number {
        return Math.hypot((point2[0] - point1[0]), (point2[1] - point1[1]));
    }
}
