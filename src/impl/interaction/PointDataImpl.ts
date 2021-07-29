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

import type {PointData} from "../../api/interaction/PointData";
import {PointingDataBase} from "./PointingDataBase";

/**
 * Single point interaction data implementation with write accesses.
 */
export class PointDataImpl extends PointingDataBase implements PointData {
    protected buttonData: number = 0;

    protected buttonsData: number = 0;

    protected movementXData: number = 0;

    protected movementYData: number = 0;

    protected offsetXData: number = 0;

    protected offsetYData: number = 0;

    protected relatedTargetData: EventTarget | null = null;

    public override flush(): void {
        super.flush();
        this.buttonData = 0;
        this.buttonsData = 0;
        this.movementXData = 0;
        this.movementYData = 0;
        this.offsetXData = 0;
        this.offsetYData = 0;
        this.relatedTargetData = null;
    }

    public override copy(data: PointData): void {
        super.copy(data);
        // Cannot use Object.assign because of a strange implementation of Event
        // that prevents accessing the properties
        this.buttonData = data.button;
        this.buttonsData = data.buttons;
        this.movementXData = data.movementX;
        this.movementYData = data.movementY;
        this.offsetXData = data.offsetX;
        this.offsetYData = data.offsetY;
        this.relatedTargetData = data.relatedTarget;
    }

    public get button(): number {
        return this.buttonData;
    }

    public get buttons(): number {
        return this.buttonsData;
    }

    public get movementX(): number {
        return this.movementXData;
    }

    public get movementY(): number {
        return this.movementYData;
    }

    public get offsetX(): number {
        return this.offsetXData;
    }

    public get offsetY(): number {
        return this.offsetYData;
    }

    public get relatedTarget(): EventTarget | null {
        return this.relatedTargetData;
    }
}
