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

import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {TwoTouchData} from "../../api/interaction/TwoTouchData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";

export class TwoTouchDataImpl implements TwoTouchData {
    protected readonly t1: SrcTgtTouchDataImpl;

    protected readonly t2: SrcTgtTouchDataImpl;

    public constructor() {
        this.t1 = new SrcTgtTouchDataImpl();
        this.t2 = new SrcTgtTouchDataImpl();
    }

    public get touch1(): SrcTgtPointsData<TouchData> {
        return this.t1;
    }

    public get touch2(): SrcTgtPointsData<TouchData> {
        return this.t2;
    }

    public flush(): void {
        this.t1.flush();
        this.t2.flush();
    }

    public copySrcTouch1(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        this.t1.copySrc(data, evt, allTouches);
    }

    public copyTgtTouch1(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        this.t1.copyTgt(data, evt, allTouches);
    }

    public copySrcTouch2(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        this.t2.copySrc(data, evt, allTouches);
    }

    public copyTgtTouch2(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        this.t2.copyTgt(data, evt, allTouches);
    }

    public isVertical(pxTolerance: number): boolean {
        return this.isTop(pxTolerance) || this.isBottom(pxTolerance);
    }

    public isHorizontal(pxTolerance: number): boolean {
        return this.isLeft(pxTolerance) || this.isRight(pxTolerance);
    }

    public isLeft(pxTolerance: number): boolean {
        return this.t1.isLeft(pxTolerance) && this.t2.isLeft(pxTolerance);
    }

    public isRight(pxTolerance: number): boolean {
        return this.t1.isRight(pxTolerance) && this.t2.isRight(pxTolerance);
    }

    public isTop(pxTolerance: number): boolean {
        return this.t1.isTop(pxTolerance) && this.t2.isTop(pxTolerance);
    }

    public isBottom(pxTolerance: number): boolean {
        return this.t1.isBottom(pxTolerance) && this.t2.isBottom(pxTolerance);
    }
}
