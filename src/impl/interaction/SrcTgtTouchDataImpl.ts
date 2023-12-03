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

import {SrcTgtDataBase} from "./SrcTgtDataBase";
import {TouchDataImpl} from "./TouchDataImpl";
import type {EventModifierData} from "../../api/interaction/EventModifierData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";

/**
 * The user interaction data for touch-DnD interactions
 */
export class SrcTgtTouchDataImpl extends SrcTgtDataBase<TouchData, TouchDataImpl> {
    public constructor() {
        super(new TouchDataImpl(), new TouchDataImpl());
    }

    public copySrc(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        this.srcData.copy(TouchDataImpl.mergeTouchEventData(data, evt, allTouches));
    }

    public copyTgt(data: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): void {
        this.tgtData.copy(TouchDataImpl.mergeTouchEventData(data, evt, allTouches));
    }
}
