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

import {UnitInteractionData} from "./UnitInteractionData";

/**
 * Data of user interactions that have key modifires.
 * Documentation from the Mozilla Web API website.
 */
export interface EventModifierData extends UnitInteractionData {
    /**
     * True if the alt key was down when the mouse event was fired.
     */
    readonly altKey: boolean;

    /**
     * True if the control key was down when the mouse event was fired.
     */
    readonly ctrlKey: boolean;

    /**
     * True if the meta key was down when the mouse event was fired.
     */
    readonly metaKey: boolean;

    /**
     * True if the shift key was down when the mouse event was fired.
     */
    readonly shiftKey: boolean;
}
