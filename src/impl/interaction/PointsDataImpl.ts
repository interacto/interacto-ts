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

import type {PointsData} from "../../api/interaction/PointsData";
import type {PointData} from "../../api/interaction/PointData";
import {peek} from "../util/ArrayUtil";

export class PointsDataImpl implements PointsData {
    private currentPositionData?: PointData;

    private readonly pointsData: Array<PointData>;

    public constructor() {
        this.pointsData = [];
    }

    public get points(): ReadonlyArray<PointData> {
        return [...this.pointsData];
    }

    public get currentPosition(): PointData | undefined {
        return this.currentPositionData;
    }

    public set currentPosition(position: PointData | undefined) {
        this.currentPositionData = position;
    }

    public get lastButton(): number | undefined {
        return peek(this.pointsData)?.button;
    }

    public addPoint(ptData: PointData): void {
        this.pointsData.push(ptData);
    }

    public flush(): void {
        this.pointsData.length = 0;
        this.currentPositionData = undefined;
    }
}
