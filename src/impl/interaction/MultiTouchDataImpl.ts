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

import type {Flushable} from "./Flushable";
import type {SrcTgtTouchDataImpl} from "./SrcTgtTouchDataImpl";
import type {MultiTouchData} from "../../api/interaction/MultiTouchData";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";

/**
 * Multi-touch interaction data implementation
 */
export class MultiTouchDataImpl implements MultiTouchData, Flushable {
    protected readonly touchesData: Map<number, SrcTgtTouchDataImpl>;

    /**
     * Creates the interaction data
     */
    public constructor() {
        this.touchesData = new Map<number, SrcTgtTouchDataImpl>();
    }

    public get touches(): ReadonlyArray<SrcTgtPointsData<TouchData>> {
        return Array.from(this.touchesData.values());
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
        for (const data of this.touchesData.values()) {
            data.flush();
        }
        this.touchesData.clear();
    }

    /**
     * Sets new value for the given touch point.
     * The identifier of the given event point is used to find the corresponding
     * touch data.
     * @param tp - The touch event data to use.
     * @param evt - The touch event
     */
    public setTouch(tp: Touch, evt: TouchEvent): void {
        const tdata = this.touchesData.get(tp.identifier);
        if (tdata !== undefined) {
            tdata.copyTgt(tp, evt, Array.from(evt.touches));
        }
    }

    /**
     * @returns True if the line of each touch is relatively horizontal and in the same direction.
     * @param pxTolerance - The pixel tolerance for considering the line horizontal.
     */
    public isHorizontal(pxTolerance: number): boolean {
        // Direction of the touches, every touch must go in the same direction
        let direction = 0;

        for (const touch of this.touchesData) {
            // Initial touch decides the direction for this interaction, either -1 or 1
            if (direction === 0) {
                direction = touch[1].diffScreenX / Math.abs(touch[1].diffScreenX);
            }
            if (!touch[1].isHorizontal(pxTolerance) || (touch[1].diffScreenX / Math.abs(touch[1].diffScreenX) !== direction)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @returns True if the line of each touch is relatively vertical and in the same direction.
     * @param pxTolerance - The pixel tolerance for considering the lines vertical.
     */
    public isVertical(pxTolerance: number): boolean {
        // Direction of the touches, every touch must go in the same direction
        let direction = 0;

        for (const touch of this.touchesData) {
            // Initial touch decides the direction for this interaction, either -1 or 1
            if (direction === 0) {
                direction = touch[1].diffScreenY / Math.abs(touch[1].diffScreenY);
            }
            if (!touch[1].isVertical(pxTolerance) || (touch[1].diffScreenY / Math.abs(touch[1].diffScreenY) !== direction)) {
                return false;
            }
        }
        return true;
    }
}
