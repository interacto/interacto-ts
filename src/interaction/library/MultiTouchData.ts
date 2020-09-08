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

import {InteractionData} from "../InteractionData";
import {SrcTgtTouchData, SrcTgtTouchDataImpl} from "./SrcTgtTouchData";

/**
 * Multi-touch interaction data interface
 */
export interface MultiTouchData extends InteractionData {
    /**
     * @return The list of touch data.
     */
    getTouchData(): Array<SrcTgtTouchData>;
}


/**
 * Multi-touch interaction data implementation
 */
export class MultiTouchDataImpl implements MultiTouchData {
    private readonly touchesData: Map<number, SrcTgtTouchDataImpl>;

    /**
     * Creates the interaction data
     */
    public constructor() {
        this.touchesData = new Map<number, SrcTgtTouchDataImpl>();
    }

    public getTouchData(): Array<SrcTgtTouchData> {
        return [...this.touchesData.values()];
    }

    /**
     * Adds a touch data to this multi-touch data
     * @param data The touch data to add
     */
    public addTouchData(data: SrcTgtTouchDataImpl): void {
        const id = data.getTouchId();
        if (id !== undefined) {
            this.touchesData.set(id, data);
        }
    }

    public removeTouchData(id: number): void {
        const tdata = this.touchesData.get(id);
        if (tdata !== undefined) {
            this.touchesData.delete(id);
            tdata.flush();
        }
    }

    public flush(): void {
        this.touchesData.forEach(data => data.flush());
        this.touchesData.clear();
    }

    /**
     * Sets new value for the given touch point.
     * The identifier of the given event point is used to find the corresponding
     * touch data.
     * @param tp The touch event to use.
     */
    public setTouch(tp: Touch | null): void {
        if (tp !== null) {
            const tdata = this.touchesData.get(tp.identifier);
            if (tdata !== undefined) {
                tdata.setTgtData(tp.clientX, tp.clientY, tp.screenX, tp.screenY, tp.target);
            }
        }
    }
}
