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
import {PointDataImpl} from "../../impl/interaction/library/PointDataImpl";

/**
 * The touch interaction data interface
 */
export interface TouchData extends PointData {
    /**
     * @return The ID of the touch.
     */
    getTouchId(): number | undefined;
}

export class TouchDataImpl extends PointDataImpl implements TouchData {
    private touchID: number | undefined;

    public constructor(id?: number, cx?: number, cy?: number, sx?: number, sy?: number, target?: EventTarget) {
        super();
        this.touchID = id;
        this.setPointData(cx, cy, sx, sy, undefined, target, target);
    }

    public getTouchId(): number | undefined {
        return this.touchID;
    }

    public setTouchId(id: number): void {
        this.touchID = id;
    }

    public flush(): void {
        super.flush();
        this.touchID = undefined;
    }

    public getButton(): number | undefined {
        return undefined;
    }
}

