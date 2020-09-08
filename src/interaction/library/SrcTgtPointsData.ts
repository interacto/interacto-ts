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

import {PointData} from "./PointData";
import {PointDataImpl} from "./PointDataImpl";

/**
 * Interaction data for a single pointing device that moves from a source
 * position to a target position.
 */
export interface SrcTgtPointsData extends PointData {
    /**
     * @return The object picked at the target location.
     */
    getTgtObject(): EventTarget | undefined;

    /**
     * @return The last X-client position.
     */
    getTgtClientX(): number;

    /**
     * @return The last Y-client position.
     */
    getTgtClientY(): number;

    /**
     * @return The last X-screen position.
     */
    getTgtScreenX(): number;

    /**
     * @return The last Y-screen position.
     */
    getTgtScreenY(): number;
}

export class SrcTgtPointsDataImpl extends PointDataImpl implements SrcTgtPointsData {
    /** The object pick at the end of the interaction*/
    protected tgtObject?: EventTarget;

    protected tgtClientX?: number;

    protected tgtClientY?: number;

    protected tgtScreenX?: number;

    protected tgtScreenY?: number;

    public getTgtClientX(): number {
        return this.tgtClientX ?? 0;
    }

    public getTgtClientY(): number {
        return this.tgtClientY ?? 0;
    }

    public getTgtScreenX(): number {
        return this.tgtScreenX ?? 0;
    }

    public getTgtScreenY(): number {
        return this.tgtScreenY ?? 0;
    }

    public getTgtObject(): EventTarget | undefined {
        return this.tgtObject;
    }

    public setTgtData(cx?: number, cy?: number, sx?: number, sy?: number, target?: EventTarget): void {
        this.tgtClientX = cx;
        this.tgtClientY = cy;
        this.tgtScreenX = sx;
        this.tgtScreenY = sy;
        this.tgtObject = target;
    }

    public flush(): void {
        super.flush();
        this.tgtClientX = undefined;
        this.tgtClientY = undefined;
        this.tgtScreenX = undefined;
        this.tgtScreenY = undefined;
        this.tgtObject = undefined;
    }
}
