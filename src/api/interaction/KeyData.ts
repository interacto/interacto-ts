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
import {EventModifierData} from "./EventModifierData";

/**
 * The data of keyboard-based user interactions.
 * Based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent (documentation extracted from here)
 */
export interface KeyData extends UnitInteractionData, EventModifierData {
    /**
     * A string with the code value of the physical key represented by the event.
     * Warning: This ignores the user's keyboard layout, so that if the user presses
     * the key at the "Y" position in a QWERTY keyboard layout this will always return "KeyY",
     * even if the user has a QWERTZ keyboard.
     */
    readonly code: string;

    /**
     * A string that represents the key value of the key represented by the event.
     */
    readonly key: string;

    /**
     * A number that represents the location of the key on the keyboard or other input device.
     */
    readonly location: number;

    /**
     * A boolean that is true if the key is being held down such that it is automatically repeating.
     */
    readonly repeat: boolean;
}
