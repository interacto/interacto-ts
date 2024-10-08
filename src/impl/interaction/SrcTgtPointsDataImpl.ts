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
import {SrcTgtDataBase} from "./SrcTgtDataBase";
import type {PointData} from "../../api/interaction/PointData";

/**
 * The user interaction data for mouse-based DnD interactions
 * @category Interaction Data
 */
export class SrcTgtPointsDataImpl extends SrcTgtDataBase<PointData, PointDataImpl> {
    public constructor() {
        super(new PointDataImpl(), new PointDataImpl());
    }

    public copySrc(data: PointData): void {
        this.srcData.copy(data);
    }

    public copyTgt(data: PointData): void {
        this.tgtData.copy(data);
    }

    public override get src(): PointDataImpl {
        return this.srcData;
    }

    public override get tgt(): PointDataImpl {
        return this.tgtData;
    }
}
