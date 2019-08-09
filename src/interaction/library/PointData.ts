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

import {Optional} from "../../util/Optional";

export interface PointData {
    /**
     * @return True: the alt key is pressed.
     */
    isAltPressed(): boolean;

    /**
     * @return True: the control key is pressed.
     */
    isCtrlPressed(): boolean;

    /**
     * @return True: the shift key is pressed.
     */
    isShiftPressed(): boolean;

    /**
     * @return True: the meta key is pressed.
     */
    isMetaPressed(): boolean;

    /**
     * @return The pressed X-client position.
     */
    getSrcClientX(): number;

    /**
     * @return The pressed Y-client position.
     */
    getSrcClientY(): number;

    /**
     * @return The pressed X-screen position.
     */
    getSrcScreenX(): number;

    /**
     * @return The pressed Y-screen position.
     */
    getSrcScreenY(): number;

    /**
     * @return The button used for the pressure.
     */
    getButton(): number | undefined;

    /**
     * @return The object picked at the pressed position.
     */
    getSrcObject(): Optional<EventTarget>;

    getCurrentTarget(): Optional<EventTarget>;
}
