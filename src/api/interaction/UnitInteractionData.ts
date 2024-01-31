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

import type {InteractionData} from "./InteractionData";

/**
 * Basic data of user interactions.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Event (documentation extracted from here)
 * @category API Interaction Data
 */
export interface UnitInteractionData extends InteractionData {
    /**
     * The time at which the event was created (in milliseconds).
     * By specification, this value is time since epoch—but in reality, browsers' definitions vary.
     * In addition, work is underway to change this to be a DOMHighResTimeStamp instead.
     */
    readonly timeStamp: number;

    /**
     * A reference to the target to which the event was originally dispatched.
     */
    readonly target: EventTarget | null;

    /**
     * A reference to the currently registered target for the event.
     * This is the object to which the event is currently slated to be sent.
     * It's possible this has been changed along the way through retargeting.
     */
    readonly currentTarget: EventTarget | null;
}
