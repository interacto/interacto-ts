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

import {PointDataImpl} from "./PointDataImpl";
import type {WheelData} from "../../api/interaction/WheelData";

/**
 * Single point interaction data whith mousewheel implementation with write accesses.
 * @category Interaction Data
 */
export class WheelDataImpl extends PointDataImpl implements WheelData {
    private deltaModeData = 0;

    private deltaXData = 0;

    private deltaYData = 0;

    private deltaZData = 0;

    public override flush(): void {
        super.flush();
        this.deltaModeData = 0;
        this.deltaXData = 0;
        this.deltaYData = 0;
        this.deltaZData = 0;
    }

    public override copy(data: WheelData): void {
        super.copy(data);
        /*
         * Cannot use Object.assign because of a strange implementation of Event
         * that prevents accessing the properties
         */
        this.deltaXData = data.deltaX;
        this.deltaYData = data.deltaY;
        this.deltaZData = data.deltaZ;
        this.deltaModeData = data.deltaMode;
    }

    public get deltaMode(): number {
        return this.deltaModeData;
    }

    public get deltaX(): number {
        return this.deltaXData;
    }

    public get deltaY(): number {
        return this.deltaYData;
    }

    public get deltaZ(): number {
        return this.deltaZData;
    }
}
