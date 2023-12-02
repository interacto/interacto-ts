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

import {MultiTouchDataBase} from "./MultiTouchDataImpl";
import {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";
import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {TwoTouchData} from "../../api/interaction/TwoTouchData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";

/**
 * The implementation class of TwoTouchData
 */
export abstract class TwoTouchDataImpl extends MultiTouchDataBase implements TwoTouchData {
    protected readonly t1: SrcTgtTouchDataImpl;

    protected readonly t2: SrcTgtTouchDataImpl;

    protected constructor() {
        super();
        this.t1 = new SrcTgtTouchDataImpl();
        this.t2 = new SrcTgtTouchDataImpl();
    }

    public get touch1(): SrcTgtPointsData<TouchData> {
        return this.t1;
    }

    public get touch2(): SrcTgtPointsData<TouchData> {
        return this.t2;
    }

    public get touches(): ReadonlyArray<SrcTgtPointsData<TouchData>> {
        return [this.t1, this.t2];
    }

    public flush(): void {
        this.t1.flush();
        this.t2.flush();
    }

    public initTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        if (this.t1.src.identifier === -1) {
            this.t1.copySrc(data, evt, allTouches);
            this.t1.copyTgt(data, evt, allTouches);
        } else {
            if (this.t2.src.identifier === -1) {
                this.t2.copySrc(data, evt, allTouches);
                this.t2.copyTgt(data, evt, allTouches);
            }
        }
    }

    public copyTouch(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        if (this.t1.src.identifier === data.identifier) {
            this.t1.copyTgt(data, evt, allTouches);
        } else {
            if (this.t2.src.identifier === data.identifier) {
                this.t2.copyTgt(data, evt, allTouches);
            }
        }
    }

    public get diffClientX(): number {
        return (this.t1.diffClientX + this.t2.diffClientX) / 2;
    }

    public get diffClientY(): number {
        return (this.t1.diffClientY + this.t2.diffClientY) / 2;
    }

    public get diffPageX(): number {
        return (this.t1.diffPageX + this.t2.diffPageX) / 2;
    }

    public get diffPageY(): number {
        return (this.t1.diffPageY + this.t2.diffPageY) / 2;
    }

    public get diffScreenX(): number {
        return (this.t1.diffScreenX + this.t2.diffScreenX) / 2;
    }

    public get diffScreenY(): number {
        return (this.t1.diffScreenY + this.t2.diffScreenY) / 2;
    }
}
