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

import type {PointBaseData} from "../../api/interaction/PointBaseData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {Flushable} from "./Flushable";

export abstract class SrcTgtDataBase<T extends PointBaseData, S extends Flushable & T> implements SrcTgtPointsData<T> {
    protected readonly srcData: S;

    protected readonly tgtData: S;

    protected constructor(src: S, tgt: S) {
        this.srcData = src;
        this.tgtData = tgt;
    }

    public get src(): T {
        return this.srcData;
    }

    public get tgt(): T {
        return this.tgtData;
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
        return Math.hypot(this.diffScreenX, this.diffScreenY) / this.duration;
    }

    public isHorizontal(pxTolerance: number): boolean {
        return Math.abs(this.diffScreenY) <= pxTolerance;
    }

    public isVertical(pxTolerance: number): boolean {
        return Math.abs(this.diffScreenX) <= pxTolerance;
    }

    public isLeft(pxTolerance: number): boolean {
        return this.isHorizontal(pxTolerance) && this.tgt.screenX < this.src.screenX;
    }

    public isRight(pxTolerance: number): boolean {
        return this.isHorizontal(pxTolerance) && this.tgt.screenX > this.src.screenX;
    }

    public isTop(pxTolerance: number): boolean {
        return this.isVertical(pxTolerance) && this.tgt.screenY < this.src.screenY;
    }

    public isBottom(pxTolerance: number): boolean {
        return this.isVertical(pxTolerance) && this.tgt.screenY > this.src.screenY;
    }

    public flush(): void {
        this.srcData.flush();
        this.tgtData.flush();
    }
}
