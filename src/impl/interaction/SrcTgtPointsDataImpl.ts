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

import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import {PointDataImpl} from "./PointDataImpl";
import type {PointData} from "../../api/interaction/PointData";

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

    public get diffClientX(): number {
        return this.tgt.clientX - this.src.clientX;
    }

    public get diffClientY(): number {
        return this.tgt.clientY - this.src.clientY;
    }

    public get diffPageX(): number {
        return this.tgt.pageX - this.src.pageX;
    }

    public get diffPageY(): number {
        return this.tgt.pageY - this.src.pageY;
    }

    public get diffScreenX(): number {
        return this.tgt.screenX - this.src.screenX;
    }

    public get diffScreenY(): number {
        return this.tgt.screenY - this.src.screenY;
    }

    public get duration(): number {
        return this.tgtData.timeStamp - this.srcData.timeStamp;
    }

    public get velocity(): number {
        return Math.sqrt(this.diffScreenX ** 2 + this.diffScreenY ** 2) / this.duration * 1000;
    }

    public isHorizontal(pxTolerance: number): boolean {
        return Math.abs(this.diffScreenY) < pxTolerance;
    }

    public isVertical(pxTolerance: number): boolean {
        return Math.abs(this.diffScreenX) < pxTolerance;
    }
}
