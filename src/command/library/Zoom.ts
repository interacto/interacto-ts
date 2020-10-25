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

import {PositionCommand} from "./PositionCommand";
import {Zoomable} from "../../properties/Zoomable";

/**
 * Initialises a Zoom command.
 * @author Arnaud BLOUIN
 */
export class Zoom extends PositionCommand {
    /**
     * The object to zoom.
     */
    protected readonly zoomable: Zoomable;

    /**
     * The zooming level.
     */
    protected zoomLevel: number;

    public constructor(zoomable: Zoomable) {
        super();
        this.zoomLevel = NaN;
        this.zoomable = zoomable;
    }

    public canDo(): boolean {
        return this.zoomLevel >= this.zoomable.getMinZoom() && this.zoomLevel <= this.zoomable.getMaxZoom();
    }

    protected doCmdBody(): void {
        this.zoomable.setZoom(this.px, this.py, this.zoomLevel);
    }

    /**
     * @param {number} newZoomLevel the zoomLevel to set.
     */
    public setZoomLevel(newZoomLevel: number): void {
        this.zoomLevel = newZoomLevel;
    }
}
