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

import type {MultiTouchData} from "../../api/interaction/MultiTouchData";
import type {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";
import type {Flushable} from "./Flushable";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";

/**
 * Multi-touch interaction data implementation
 */
export class MultiTouchDataImpl implements MultiTouchData, Flushable {
    private readonly touchesData: Map<number, SrcTgtTouchDataImpl>;

    /**
     * Creates the interaction data
     */
    public constructor() {
        this.touchesData = new Map<number, SrcTgtTouchDataImpl>();
    }

    public get touches(): ReadonlyArray<SrcTgtPointsData<TouchData>> {
        return [...this.touchesData.values()];
    }

    /**
     * Adds a touch data to this multi-touch data
     * @param data - The touch data to add
     */
    public addTouchData(data: SrcTgtTouchDataImpl): void {
        this.touchesData.set(data.src.identifier, data);
    }

    public removeTouchData(id: number): void {
        const tdata = this.touchesData.get(id);
        if (tdata !== undefined) {
            this.touchesData.delete(id);
            tdata.flush();
        }
    }

    public flush(): void {
        this.touchesData.forEach(data => {
            data.flush();
        });
        this.touchesData.clear();
    }

    /**
     * Sets new value for the given touch point.
     * The identifier of the given event point is used to find the corresponding
     * touch data.
     * @param tp - The touch event data to use.
     * @param evt - The touch event
     */
    public setTouch(tp: Touch, evt: TouchEvent): void {
        const tdata = this.touchesData.get(tp.identifier);
        if (tdata !== undefined) {
            tdata.copyTgt(tp, evt, [...evt.touches]);
        }
    }

    /**
     * Returns true if the line of each touch is relatively horizontal and in the same direction.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    public isHorizontal(pxTolerance: number): boolean {
        // Direction of the touches, every touch must go in the same direction
        let direction = 0;

        for (const touch of this.touchesData) {
            // Initial touch decides the direction for this interaction, either -1 or 1
            if (direction === 0) {
                direction = touch[1].diffScreenX / Math.abs(touch[1].diffScreenX);
            }
            if (!touch[1].isHorizontal(pxTolerance) || (touch[1].diffScreenX / Math.abs(touch[1].diffScreenX) !== direction)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns true if the line of each touch is relatively vertical and in the same direction.
     * @param pxTolerance - The pixel tolerance for considering the lines vertical.
     */
    public isVertical(pxTolerance: number): boolean {
        // Direction of the touches, every touch must go in the same direction
        let direction = 0;

        for (const touch of this.touchesData) {
            // Initial touch decides the direction for this interaction, either -1 or 1
            if (direction === 0) {
                direction = touch[1].diffScreenY / Math.abs(touch[1].diffScreenY);
            }
            if (!touch[1].isVertical(pxTolerance) || (touch[1].diffScreenY / Math.abs(touch[1].diffScreenY) !== direction)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns the distance between the end position of the touches divided the distance between the starting position of the touches.
     * If more or less than two touches are involved, or if the touches do not get closer during the interaction or follow the same line,
     * the method returns undefined.
     * @param pxTolerance - The pixel tolerance for considering that the two touches are moving on the same line.
     */
    public pinchFactor(pxTolerance: number): number | undefined {
        // 1. Check that there are 2 touches
        if (this.touches.length !== 2) {
            return undefined;
        }

        const tgt1 = [this.touches[0].tgt.screenX, this.touches[0].tgt.screenY];
        const tgt2 = [this.touches[1].tgt.screenX, this.touches[1].tgt.screenY];

        const src1 = [this.touches[0].src.screenX, this.touches[0].src.screenY];
        const src2 = [this.touches[1].src.screenX, this.touches[1].src.screenY];

        const vector1 = [this.touches[0].diffScreenX, this.touches[0].diffScreenY];
        const vector2 = [this.touches[1].diffScreenX, this.touches[1].diffScreenY];

        // 2. Define the line between the 2 sources
        const lineVector = [tgt2[0] - tgt1[0], tgt2[1] - tgt1[1]];

        // 3. For each touch, define the projection of the target on the line
        const projection1 = MultiTouchDataImpl.project(vector1, lineVector);
        const projectionVector1 = [projection1 * lineVector[0], projection1 * lineVector[1]];

        const projection2 = MultiTouchDataImpl.project(vector2, lineVector);
        const projectionVector2 = [projection2 * lineVector[0], projection2 * lineVector[1]];

        // 4. Check that  the projections have opposite signs
        if (projection1 / Math.abs(projection1) === projection2 / Math.abs(projection2)) {
            return undefined;
        }

        // 5. Calculate the distances between the targets and the projected points and check they are < pxTolerance
        const distance1 = MultiTouchDataImpl.distance(projectionVector1, vector1);
        const distance2 = MultiTouchDataImpl.distance(projectionVector2, vector2);

        if (distance1 > pxTolerance || distance2 > pxTolerance) {
            return undefined;
        }

        // 6. Calculate the ratio between the distance between the end position of the touches
        // and the distance between the starting position of the touches
        return MultiTouchDataImpl.distance(tgt1, tgt2) / MultiTouchDataImpl.distance(src1, src2);
    }

    /**
     * Returns the value of the projection of vector1 on vector2
     */
    public static project(vector1: Array<number>, vector2: Array<number>): number {
        return (vector1[0] * vector2[0] + vector1[1] * vector2[1]) / (vector2[0] ** 2 + vector2[1] ** 2);
    }

    /**
     * Returns the distance between point1 and point2
     */
    public static distance(point1: Array<number>, point2: Array<number>): number {
        return Math.sqrt((point2[0] - point1[0]) ** 2 + (point2[1] - point1[1]) ** 2);
    }
}
