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

import { PositionAction } from "./PositionAction";
import { Zoomable } from "../../properties/Zoomable";

/**
 * Initialises a Zoom command.
 * @since 0.2
 * @author Arnaud BLOUIN
 */
export class Zoom extends PositionAction {
    /**
     * The object to zoom.
     */
    protected zoomable: Zoomable | undefined;

    /**
     * The zooming level.
     */
    protected zoomLevel: number;

    public constructor() {
        super();
        this.zoomLevel = NaN;
    }

    /**
     *
     */
    public flush(): void {
        super.flush();
        this.zoomable = undefined;
    }

    /**
     *
     * @return {boolean}
     */
    public canDo(): boolean {
        return this.zoomable !== undefined && this.zoomLevel >= this.zoomable.getMinZoom() && this.zoomLevel <= this.zoomable.getMaxZoom();
    }

    /**
     *
     */
    protected doCmdBody(): void {
        if (this.zoomable !== undefined) {
            this.zoomable.setZoom(this.px, this.py, this.zoomLevel);
        }
    }

    /**
     * @param {*} newZoomable the zoomable to set.
     * @since 0.2
     */
    public setZoomable(newZoomable: Zoomable): void {
        this.zoomable = newZoomable;
    }

    /**
     * @param {number} newZoomLevel the zoomLevel to set.
     * @since 0.2
     */
    public setZoomLevel(newZoomLevel: number): void {
        this.zoomLevel = newZoomLevel;
    }
}
