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

import {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import {TouchData} from "../../../api/interaction/TouchData";
import {TouchDataImpl} from "./TouchDataImpl";
import {EventModifierData} from "../../../api/interaction/EventModifierData";
import {UnitInteractionData} from "../../../api/interaction/UnitInteractionData";

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
}
