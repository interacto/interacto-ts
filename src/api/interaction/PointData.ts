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


import {PointBaseData} from "./PointBaseData";

/**
 * Interaction data for a single pointing device with buttons at a single position.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent (documentation extracted from here)
 */
export interface PointData extends PointBaseData {
    /**
     * The button number that was pressed (if applicable) when the mouse event was fired.
     */
    readonly button: number;

    /**
     * The buttons being depressed (if any) when the mouse event was fired.
     */
    readonly buttons: number;

    /**
     * The X coordinate of the mouse pointer relative to the position of the last mousemove event.
     */
    readonly movementX: number;

    /**
     * The Y coordinate of the mouse pointer relative to the position of the last mousemove event.
     */
    readonly movementY: number;

    /**
     * The X coordinate of the mouse pointer relative to the position of the padding edge of the target node.
     */
    readonly offsetX: number;

    /**
     * The Y coordinate of the mouse pointer relative to the position of the padding edge of the target node.
     */
    readonly offsetY: number;

    /**
     * The secondary target for the event, if there is one.
     */
    readonly relatedTarget: EventTarget | null;
}
