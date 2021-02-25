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

import type {EventModifierData} from "./EventModifierData";

/**
 * Interaction data for a single pointing device at a single position.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent  (documentation extracted from here)
 */
export interface PointBaseData extends EventModifierData {
    /**
     * The X coordinate of the mouse pointer in local (DOM content) coordinates.
     */
    readonly clientX: number;

    /**
     * The Y coordinate of the mouse pointer in local (DOM content) coordinates.
     */
    readonly clientY: number;

    /**
     * The X coordinate of the mouse pointer relative to the whole document.
     */
    readonly pageX: number;

    /**
     * The Y coordinate of the mouse pointer relative to the whole document.
     */
    readonly pageY: number;

    /**
     * The X coordinate of the mouse pointer in global (screen) coordinates.
     */
    readonly screenX: number;

    /**
     * The Y coordinate of the mouse pointer in global (screen) coordinates.
     */
    readonly screenY: number;
}
