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

import type {MultiTouchData} from "../../api/interaction/MultiTouchData";
import type {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";
import type {Flushable} from "./Flushable";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";

/**
 * Multi-touch interaction data implementation
 */
export class MultiTouchDataImpl implements MultiTouchData, Flushable {
    private readonly touchesData: Map<number, SrcTgtTouchDataImpl>;

    /**
     * Creates the interaction data
     */
    public constructor() {
        this.touchesData = new Map<number, SrcTgtTouchDataImpl>();
    }

    public get touches(): ReadonlyArray<SrcTgtPointsData<TouchData>> {
        return [...this.touchesData.values()];
    }

    /**
     * Adds a touch data to this multi-touch data
     * @param data - The touch data to add
     */
    public addTouchData(data: SrcTgtTouchDataImpl): void {
        this.touchesData.set(data.src.identifier, data);
    }

    public removeTouchData(id: number): void {
        const tdata = this.touchesData.get(id);
        if (tdata !== undefined) {
            this.touchesData.delete(id);
            tdata.flush();
        }
    }

    public flush(): void {
        this.touchesData.forEach(data => {
            data.flush();
        });
        this.touchesData.clear();
    }

    /**
     * Sets new value for the given touch point.
     * The identifier of the given event point is used to find the corresponding
     * touch data.
     * @param tp - The touch event to use.
     */
    public setTouch(tp: Touch, evt: TouchEvent): void {
        const tdata = this.touchesData.get(tp.identifier);
        if (tdata !== undefined) {
            tdata.copyTgt(tp, evt);
        }
    }
}
