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

import {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import {PointDataImpl} from "./PointDataImpl";
import {PointData} from "../../api/interaction/PointData";

export class SrcTgtPointsDataImpl implements SrcTgtPointsData<PointData> {
    private readonly srcData: PointDataImpl;

    private readonly tgtData: PointDataImpl;

    public constructor() {
        this.srcData = new PointDataImpl();
        this.tgtData = new PointDataImpl();
    }

    public get src(): PointData {
        return this.srcData;
    }

    public get tgt(): PointData {
        return this.tgtData;
    }

    public flush(): void {
        this.srcData.flush();
        this.tgtData.flush();
    }

    public copySrc(data: PointData): void {
        this.srcData.copy(data);
    }

    public copyTgt(data: PointData): void {
        this.tgtData.copy(data);
    }
}
