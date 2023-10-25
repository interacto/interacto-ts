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

import type {PointData} from "../../api/interaction/PointData";
import {PointsDataImpl} from "./PointsDataImpl";

/**
 * Tapping interaction data implementation
 */
export class MousePointsDataImpl extends PointsDataImpl<PointData> {
    private currentPositionData: PointData | undefined;

    /**
     * Creates the interaction data
     */
    public constructor() {
        super();
    }

    public get currentPosition(): PointData | undefined {
        return this.currentPositionData;
    }

    public set currentPosition(position: PointData | undefined) {
        this.currentPositionData = position;
    }

    public get lastButton(): number | undefined {
        return this.pointsData.at(-1)?.button;
    }

    public override flush(): void {
        super.flush();
        this.currentPositionData = undefined;
    }
}
