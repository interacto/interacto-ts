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

import {GeneralTwoTouchDataImpl} from "./GeneralTwoTouchDataImpl";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";
import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {ThreeTouchData} from "../../api/interaction/ThreeTouchData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";

/**
 * The user interaction data for three-touch interactions
 */
export class ThreeTouchDataImpl extends GeneralTwoTouchDataImpl implements ThreeTouchData {
    protected readonly t3: SrcTgtTouchDataImpl;

    public constructor() {
        super();
        this.t3 = new SrcTgtTouchDataImpl();
    }

    public get touch3(): SrcTgtPointsData<TouchData> {
        return this.t3;
    }

    public override flush(): void {
        super.flush();
        this.t3.flush();
    }

    public override initTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        // If only t3 is not initialised
        if (this.t3.src.identifier === -1 && this.t2.src.identifier !== -1) {
            this.t3.copySrc(data, evt, allTouches);
            this.t3.copyTgt(data, evt, allTouches);
        } else {
            super.initTouch(data, evt, allTouches);
        }
    }

    public override copyTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        if (this.t3.src.identifier === data.identifier) {
            this.t3.copyTgt(data, evt, allTouches);
        } else {
            super.copyTouch(data, evt, allTouches);
        }
    }

    public override isLeft(pxTolerance: number): boolean {
        return super.isLeft(pxTolerance) && this.t3.isLeft(pxTolerance);
    }

    public override isRight(pxTolerance: number): boolean {
        return super.isRight(pxTolerance) && this.t3.isRight(pxTolerance);
    }

    public override isTop(pxTolerance: number): boolean {
        return super.isTop(pxTolerance) && this.t3.isTop(pxTolerance);
    }

    public override isBottom(pxTolerance: number): boolean {
        return super.isBottom(pxTolerance) && this.t3.isBottom(pxTolerance);
    }
}
