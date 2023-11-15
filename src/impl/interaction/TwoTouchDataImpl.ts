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

import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {TwoTouchData} from "../../api/interaction/TwoTouchData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";

export class TwoTouchDataImpl implements TwoTouchData {
    protected readonly t1: SrcTgtTouchDataImpl;

    protected readonly t2: SrcTgtTouchDataImpl;

    public constructor() {
        this.t1 = new SrcTgtTouchDataImpl();
        this.t2 = new SrcTgtTouchDataImpl();
    }

    public get touch1(): SrcTgtPointsData<TouchData> {
        return this.t1;
    }

    public get touch2(): SrcTgtPointsData<TouchData> {
        return this.t2;
    }

    public get touches(): ReadonlyArray<SrcTgtPointsData<TouchData>> {
        return [this.t1, this.t2];
    }

    public flush(): void {
        this.t1.flush();
        this.t2.flush();
    }

    public initTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        if (this.t1.src.identifier === -1) {
            this.t1.copySrc(data, evt, allTouches);
            this.t1.copyTgt(data, evt, allTouches);
        } else {
            if (this.t2.src.identifier === -1) {
                this.t2.copySrc(data, evt, allTouches);
                this.t2.copyTgt(data, evt, allTouches);
            }
        }
    }

    public copyTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        if (this.t1.src.identifier === data.identifier) {
            this.t1.copyTgt(data, evt, allTouches);
        } else {
            if (this.t2.src.identifier === data.identifier) {
                this.t2.copyTgt(data, evt, allTouches);
            }
        }
    }

    public isVertical(pxTolerance: number): boolean {
        return this.isTop(pxTolerance) || this.isBottom(pxTolerance);
    }

    public isHorizontal(pxTolerance: number): boolean {
        return this.isLeft(pxTolerance) || this.isRight(pxTolerance);
    }

    public isLeft(pxTolerance: number): boolean {
        return this.t1.isLeft(pxTolerance) && this.t2.isLeft(pxTolerance);
    }

    public isRight(pxTolerance: number): boolean {
        return this.t1.isRight(pxTolerance) && this.t2.isRight(pxTolerance);
    }

    public isTop(pxTolerance: number): boolean {
        return this.t1.isTop(pxTolerance) && this.t2.isTop(pxTolerance);
    }

    public isBottom(pxTolerance: number): boolean {
        return this.t1.isBottom(pxTolerance) && this.t2.isBottom(pxTolerance);
    }

    /**
     * Returns the distance between the end position of the touches divided the distance between the starting position of the touches.
     * If more or less than two touches are involved, or if the touches do not get closer during the interaction or follow the same line,
     * the method returns undefined.
     * @param pxTolerance - The pixel tolerance for considering that the two touches are moving on the same line.
     */
    public pinchFactor(pxTolerance: number): number | undefined {
        // 1. Check that there are 2 touches
        const t0 = this.t1;
        const t1 = this.t2;

        if (t0.src.identifier === -1 || t1.src.identifier === -1) {
            return undefined;
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
        const projection1 = TwoTouchDataImpl.project(vector1, lineVector);
        const projectionVector1: [number, number] = [projection1 * lineVector[0], projection1 * lineVector[1]];

        const projection2 = TwoTouchDataImpl.project(vector2, lineVector);
        const projectionVector2: [number, number] = [projection2 * lineVector[0], projection2 * lineVector[1]];

        // 4. Check that the projections have opposite signs
        if (projection1 / Math.abs(projection1) === projection2 / Math.abs(projection2)) {
            return undefined;
        }

        // 5. Calculate the distances between the targets and the projected points and check they are < pxTolerance
        const distance1 = TwoTouchDataImpl.distance(projectionVector1, vector1);
        const distance2 = TwoTouchDataImpl.distance(projectionVector2, vector2);

        if (distance1 > pxTolerance || distance2 > pxTolerance || Number.isNaN(distance1) || Number.isNaN(distance2)) {
            return undefined;
        }

        // 6. Calculate the ratio between the distance between the end position of the touches
        // and the distance between the starting position of the touches
        return TwoTouchDataImpl.distance(tgt1, tgt2) / TwoTouchDataImpl.distance(src1, src2);
    }

    /**
     * Returns the value of the projection of vector1 on vector2
     */
    public static project(vector1: [number, number], vector2: [number, number]): number {
        return (vector1[0] * vector2[0] + vector1[1] * vector2[1]) / (vector2[0] ** 2 + vector2[1] ** 2);
    }

    /**
     * Returns the distance between point1 and point2
     */
    public static distance(point1: [number, number], point2: [number, number]): number {
        return Math.hypot((point2[0] - point1[0]), (point2[1] - point1[1]));
    }
}
