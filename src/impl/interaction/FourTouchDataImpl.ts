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

import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";
import {ThreeTouchDataImpl} from "./ThreeTouchDataImpl";
import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {FourTouchData} from "../../api/interaction/FourTouchData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";

/**
 * The interaction data for four-touch user interactions.
 * @category Interaction Data
 */
export class FourTouchDataImpl extends ThreeTouchDataImpl implements FourTouchData {
    private readonly t4: SrcTgtTouchDataImpl;

    public constructor() {
        super();
        this.t4 = new SrcTgtTouchDataImpl();
    }

    public get touch4(): SrcTgtPointsData<TouchData> {
        return this.t4;
    }

    public override get touches(): ReadonlyArray<SrcTgtPointsData<TouchData>> {
        return [this.t1, this.t2, this.t3, this.t4];
    }

    public override initTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        // If only t4 is not initialised
        if (this.t4.src.identifier === -1 && this.t3.src.identifier !== -1) {
            this.t4.copySrc(data, evt, allTouches);
            this.t4.copyTgt(data, evt, allTouches);
        } else {
            super.initTouch(data, evt, allTouches);
        }
    }

    public override copyTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        if (this.t4.src.identifier === data.identifier) {
            this.t4.copyTgt(data, evt, allTouches);
        } else {
            super.copyTouch(data, evt, allTouches);
        }
    }

    public override flush(): void {
        super.flush();
        this.t4.flush();
    }

    public override isLeft(pxTolerance: number): boolean {
        return super.isLeft(pxTolerance) && this.t4.isLeft(pxTolerance);
    }

    public override isRight(pxTolerance: number): boolean {
        return super.isRight(pxTolerance) && this.t4.isRight(pxTolerance);
    }

    public override isTop(pxTolerance: number): boolean {
        return super.isTop(pxTolerance) && this.t4.isTop(pxTolerance);
    }

    public override isBottom(pxTolerance: number): boolean {
        return super.isBottom(pxTolerance) && this.t4.isBottom(pxTolerance);
    }
}
