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
import type {TouchData} from "../../api/interaction/TouchData";
import {TouchDataImpl} from "./TouchDataImpl";
import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";

export class SrcTgtTouchDataImpl implements SrcTgtPointsData<TouchData> {
    private readonly srcData: TouchDataImpl;

    private readonly tgtData: TouchDataImpl;

    public constructor() {
        this.srcData = new TouchDataImpl();
        this.tgtData = new TouchDataImpl();
    }

    public get src(): TouchData {
        return this.srcData;
    }

    public get tgt(): TouchData {
        return this.tgtData;
    }

    public flush(): void {
        this.srcData.flush();
        this.tgtData.flush();
    }

    public copySrc(data: Touch, evt: EventModifierData & UnitInteractionData): void {
        this.srcData.copy(TouchDataImpl.mergeTouchEventData(data, evt));
    }

    public copyTgt(data: Touch, evt: EventModifierData & UnitInteractionData): void {
        this.tgtData.copy(TouchDataImpl.mergeTouchEventData(data, evt));
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
        return Math.sqrt(this.diffScreenX ** 2 + this.diffScreenY ** 2) / this.duration;
    }

    public isHorizontal(pxTolerance: number): boolean {
        return Math.abs(this.diffScreenY) <= pxTolerance;
    }

    public isVertical(pxTolerance: number): boolean {
        return Math.abs(this.diffScreenX) <= pxTolerance;
    }
}
